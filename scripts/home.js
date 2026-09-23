const { t, locale, monthLabel, reasonText } = window.TENNORO_I18N;
const VIP_CHECKOUT_URL = window.TENNORO_CONFIG?.vipCheckoutUrl || "";
      const vipButton = document.querySelector("[data-vip-link]");

      if (vipButton) {
        vipButton.href = VIP_CHECKOUT_URL || "https://discord.gg/HUsTT7X5Pn";
      }

      const STATS_API_URL = window.TENNORO_CONFIG?.statsApiUrl || "";

      const fallbackPerformanceData = {
        updatedAt: null,
        accuracy: 86.6,
        totalPicks: 127,
        wonPicks: 110,
        profit: 421,
        roi: 4.21,
        totalStake: 6350,
        averageOdds: 1.33,
        initialBankroll: 1000,
        stakePerPick: 50,
        bankroll: 1421,
        bankrollHistory: [
          { date: "2026-06-01", value: 1000 },
          { date: "2026-06-02", value: 1042 },
          { date: "2026-06-03", value: 992 },
          { date: "2026-06-04", value: 1061 },
          { date: "2026-06-05", value: 1114 },
          { date: "2026-06-06", value: 1088 },
          { date: "2026-06-07", value: 1168 },
          { date: "2026-06-08", value: 1217 },
          { date: "2026-06-09", value: 1184 },
          { date: "2026-06-10", value: 1266 },
          { date: "2026-06-11", value: 1321 },
          { date: "2026-06-12", value: 1374 },
          { date: "2026-06-13", value: 1421 },
        ],
      };

      const numberFormatter = new Intl.NumberFormat(locale);
      const euroFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
      const compactEuroFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
      const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" });
      const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      function formatPercent(value, maximumFractionDigits = 2) {
        const number = Number(value);
        if (!Number.isFinite(number)) return "0%";
        return `${new Intl.NumberFormat(locale, { maximumFractionDigits }).format(number)}%`;
      }

      function formatEuro(value, withSign = false) {
        const number = Number(value);
        if (!Number.isFinite(number)) return "0€";
        const sign = withSign && number > 0 ? "+" : "";
        return `${sign}${euroFormatter.format(number)}€`;
      }

      function formatPickDate(value, fallback) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
      }

      function aggregateDailyBankrollHistory(history) {
        const daily = new Map();

        history.forEach((entry, index) => {
          const date = new Date(entry.date);
          const dayKey = Number.isNaN(date.getTime())
            ? `entry-${index}`
            : date.toISOString().slice(0, 10);

          daily.set(dayKey, {
            date: entry.date,
            value: entry.value,
          });
        });

        return [...daily.entries()]
          .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
          .map(([, entry]) => entry);
      }

      function normalizeStats(payload) {
        const bankroll = Number(payload?.bankroll);
        const history = Array.isArray(payload?.bankrollHistory)
          ? payload.bankrollHistory
              .map((entry, index) => ({
                date: entry?.date || t('pickNumber', {number:index+1}),
                value: Number(entry?.value),
              }))
              .filter((entry) => Number.isFinite(entry.value))
          : [];
        const normalizedHistory = history.length
          ? history
          : [{ date: payload?.updatedAt || t('current'), value: Number.isFinite(bankroll) ? bankroll : fallbackPerformanceData.bankroll }];

        return {
          ...fallbackPerformanceData,
          updatedAt: payload?.updatedAt || null,
          accuracy: Number.isFinite(Number(payload?.accuracy)) ? Number(payload.accuracy) : fallbackPerformanceData.accuracy,
          totalPicks: Math.max(0, Number(payload?.totalPicks) || 0),
          wonPicks: Math.max(0, Number(payload?.wonPicks) || 0),
          profit: Number.isFinite(Number(payload?.profit)) ? Number(payload.profit) : fallbackPerformanceData.profit,
          roi: Number.isFinite(Number(payload?.roi)) ? Number(payload.roi) : fallbackPerformanceData.roi,
          totalStake: Number.isFinite(Number(payload?.totalStake)) ? Number(payload.totalStake) : fallbackPerformanceData.totalStake,
          averageOdds: Number.isFinite(Number(payload?.averageOdds)) ? Number(payload.averageOdds) : fallbackPerformanceData.averageOdds,
          bankroll: Number.isFinite(bankroll) ? bankroll : normalizedHistory.at(-1).value,
          bankrollHistory: normalizedHistory,
        };
      }

      async function fetchPerformanceData() {
        if (!STATS_API_URL) return fallbackPerformanceData;

        try {
          const response = await fetch(STATS_API_URL, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          });

          if (!response.ok) throw new Error(`Stats endpoint returned ${response.status}`);
          return normalizeStats(await response.json());
        } catch (error) {
          console.warn("Tennoro stats fallback used:", error);
          return fallbackPerformanceData;
        }
      }

      function renderPerformanceDashboard(data) {
        const setText = (selector, value) => {
          const element = document.querySelector(selector);
          if (element) element.textContent = value;
        };

        const totalPicks = Math.max(0, Number(data.totalPicks) || 0);
        const wonPicks = Math.max(0, Number(data.wonPicks) || 0);

        setText('[data-stat="accuracy"]', formatPercent(data.accuracy, 2));
        setText(
          '[data-stat="accuracy-detail"]',
          t('picksCorrect', {total:numberFormatter.format(totalPicks), won:numberFormatter.format(wonPicks)})
        );
        setText('[data-stat="profit"]', formatEuro(data.profit, true));
        setText('[data-stat="roi"]', t('roi', {value:formatPercent(data.roi, 2)}));
        setText('[data-stat="total-stake"]', formatEuro(data.totalStake));
        setText('[data-stat="average-odds"]', t('averageOdds', {value:Number(data.averageOdds || 0).toFixed(2)}));
        const line = document.querySelector("[data-profit-line]");
        const area = document.querySelector("[data-profit-area]");
        const pointsLayer = document.querySelector("[data-profit-points]");
        const gridLayer = document.querySelector("[data-profit-grid]");
        const labelLayer = document.querySelector("[data-profit-axis-labels]");
        if (!line || !area || !pointsLayer || !gridLayer || !labelLayer || data.bankrollHistory.length < 1) return;

        const width = 980;
        const height = 320;
        const padding = { top: 18, right: 10, bottom: 58, left: 42 };
        const dailyHistory = aggregateDailyBankrollHistory(data.bankrollHistory);
        const history = dailyHistory.length === 1
          ? [dailyHistory[0], dailyHistory[0]]
          : dailyHistory;
        const values = history.map((entry) => Number(entry.value));
        const rawMin = Math.min(...values, data.initialBankroll);
        const rawMax = Math.max(1, ...values);
        const rawRange = Math.max(rawMax - rawMin, 1);
        const valuePadding = Math.max(rawRange * 0.12, Number(data.stakePerPick || 0) * 0.5, 20);
        const min = rawMin - valuePadding;
        const max = rawMax + valuePadding;
        const range = Math.max(max - min, 1);
        const yFor = (value) =>
          height - padding.bottom - ((value - min) / range) * (height - padding.top - padding.bottom);
        const xFor = (index) =>
          padding.left + (index / (values.length - 1)) * (width - padding.left - padding.right);
        const coords = values.map((value, index) => [xFor(index), yFor(value)]);
        const smoothPath = (points) => {
          if (points.length < 2) return "";
          const commands = [`M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`];

          for (let index = 0; index < points.length - 1; index += 1) {
            const previous = points[index - 1] || points[index];
            const current = points[index];
            const next = points[index + 1];
            const afterNext = points[index + 2] || next;
            const smoothing = 0.18;
            const controlA = [
              current[0] + (next[0] - previous[0]) * smoothing,
              current[1] + (next[1] - previous[1]) * smoothing,
            ];
            const controlB = [
              next[0] - (afterNext[0] - current[0]) * smoothing,
              next[1] - (afterNext[1] - current[1]) * smoothing,
            ];

            commands.push(
              `C${controlA[0].toFixed(1)} ${controlA[1].toFixed(1)}, ${controlB[0].toFixed(1)} ${controlB[1].toFixed(1)}, ${next[0].toFixed(1)} ${next[1].toFixed(1)}`
            );
          }

          return commands.join(" ");
        };
        const path = smoothPath(coords);
        const areaPath = `${path} L${coords.at(-1)[0].toFixed(1)} ${height - padding.bottom} L${coords[0][0].toFixed(1)} ${height - padding.bottom} Z`;
        const tickCount = 4;
        const step = range / tickCount;
        const yTicks = Array.from({ length: tickCount + 1 }, (_, index) => min + step * index);
        const labelIndexes = history
          .map((_, index) => index)
          .filter((index) => index === 0 || index === history.length - 1 || index % 3 === 0);
        const xTicks = labelIndexes.map((index) => [
          index,
          formatPickDate(history[index]?.date, t('pickNumber', {number:index+1})),
        ]);

        line.setAttribute("d", path);
        area.setAttribute("d", areaPath);
        gridLayer.innerHTML = [
          ...yTicks.map((tick) => {
            const y = yFor(tick).toFixed(1);
            return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"></line>`;
          }),
          ...xTicks.map(([index]) => {
            const x = xFor(index).toFixed(1);
            return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}"></line>`;
          }),
        ].join("");
        pointsLayer.innerHTML = coords
          .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"></circle>`)
          .join("");
        labelLayer.innerHTML = [
          ...yTicks.map((tick) => {
            const y = yFor(tick).toFixed(1);
            return `<text x="${padding.left - 12}" y="${y}" text-anchor="end">${compactEuroFormatter.format(tick)}€</text>`;
          }),
          ...xTicks.map(([index, label]) => {
            const x = xFor(index).toFixed(1);
            const y = height - 20;
            return `<text x="${x}" y="${y}" text-anchor="end" transform="rotate(-35 ${x} ${y})">${label}</text>`;
          }),
        ]
          .join("");
      }

      renderPerformanceDashboard(fallbackPerformanceData);
      fetchPerformanceData().then(renderPerformanceDashboard);

      document.body.classList.add("reveal-enabled");

      const revealItems = document.querySelectorAll(".reveal-on-scroll");

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.16 }
        );

        revealItems.forEach((item) => observer.observe(item));
      } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
      }
