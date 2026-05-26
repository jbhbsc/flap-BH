(function () {
  "use strict";

  const config = window.ICEFIRE_CONFIG || {};
  const state = {
    account: "",
    chainId: "",
    claimable: Number(config.DEMO_CLAIMABLE_FIRE || 0),
    hasLp: Boolean(config.DEMO_HAS_LP)
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    walletButton: $("walletButton"),
    claimButton: $("claimButton"),
    claimableAmount: $("claimableAmount"),
    lpStatus: $("lpStatus"),
    toast: $("toast"),
    burnedIce: $("burnedIce"),
    buybackCountdown: $("buybackCountdown"),
    dividendCountdown: $("dividendCountdown"),
    remainingFire: $("remainingFire"),
    heatBar: $("heatBar"),
    xLink: $("xLink"),
    qqGroupButton: $("qqGroupButton"),
    buyLink: $("buyLink"),
    contractAddressButton: $("contractAddressButton")
  };

  let buybackSeconds = 5 * 60;
  let dividendSeconds = 12 * 60 + 30;
  let burnedIce = 128430000;
  let remainingFire = 486;

  function hasEthereum() {
    return typeof window.ethereum !== "undefined";
  }

  function isAddress(value) {
    return /^0x[a-fA-F0-9]{40}$/.test(value || "");
  }

  function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function padAddressParam(address) {
    return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  }

  function weiHexToTokenAmount(hexValue) {
    if (!hexValue || hexValue === "0x") return 0;
    const wei = BigInt(hexValue);
    const whole = wei / 10n ** 18n;
    const fraction = wei % (10n ** 18n);
    return Number(`${whole}.${fraction.toString().padStart(18, "0").slice(0, 6)}`);
  }

  function showToast(message, type) {
    els.toast.textContent = message;
    els.toast.dataset.type = type || "neutral";
    els.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 3600);
  }

  function formatClock(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function formatDividendClock(seconds) {
    const safe = Math.max(0, seconds);
    const minutes = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${minutes} 分 ${String(secs).padStart(2, "0")} 秒`;
  }

  function updateWalletUi() {
    if (els.xLink) {
      els.xLink.href = config.X_URL || "https://x.com/theawarm12553";
    }
    if (els.qqGroupButton) {
      els.qqGroupButton.textContent = `QQ 群 ${config.QQ_GROUP_NUMBER || "1005679043"}`;
    }
    if (els.buyLink) {
      els.buyLink.href = config.BUY_URL || "https://gmgn.ai/";
    }
    if (els.contractAddressButton) {
      els.contractAddressButton.textContent = config.DISPLAY_CONTRACT_ADDRESS || "待配置";
    }

    if (state.account) {
      els.walletButton.textContent = `${shortAddress(state.account)} 🔥`;
      els.walletButton.title = "退出熔炉";
      els.walletButton.classList.add("connected");
    } else {
      els.walletButton.textContent = "❄️ 连接冰脉 🔥";
      els.walletButton.title = "点燃钱包";
      els.walletButton.classList.remove("connected");
    }
  }

  function updateClaimUi() {
    els.claimableAmount.textContent = state.claimable.toFixed(4);
    els.lpStatus.textContent = state.account ? (state.hasLp ? "冰-火 LP 已识别" : "未持仓冰 LP") : "等待冰脉连接";

    if (!state.account) {
      els.claimButton.disabled = true;
      els.claimButton.textContent = "未持仓冰 LP";
    } else if (!state.hasLp) {
      els.claimButton.disabled = true;
      els.claimButton.textContent = "未持仓冰 LP";
    } else if (state.claimable <= 0) {
      els.claimButton.disabled = true;
      els.claimButton.textContent = "暂无火种";
    } else {
      els.claimButton.disabled = false;
      els.claimButton.textContent = "⚡ 引燃领取 ⚡";
    }

    els.heatBar.style.width = `${Math.min(100, Math.max(8, state.claimable * 25))}%`;
  }

  async function switchChainIfNeeded() {
    if (!hasEthereum()) return;
    const desiredChain = config.CHAIN_ID || "0x38";
    state.chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (state.chainId === desiredChain) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: desiredChain }]
      });
    } catch (error) {
      if (error && error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: desiredChain,
            chainName: config.CHAIN_NAME || "BNB Smart Chain",
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            rpcUrls: [config.RPC_URL || "https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: [config.EXPLORER_URL || "https://bscscan.com/"]
          }]
        });
      } else {
        throw error;
      }
    }
    state.chainId = await window.ethereum.request({ method: "eth_chainId" });
  }

  async function refreshClaimData() {
    state.claimable = Number(config.DEMO_CLAIMABLE_FIRE || 0);
    state.hasLp = Boolean(config.DEMO_HAS_LP);

    if (
      hasEthereum() &&
      state.account &&
      isAddress(config.DIVIDEND_CONTRACT_ADDRESS) &&
      config.PENDING_REWARD_SELECTOR
    ) {
      try {
        const result = await window.ethereum.request({
          method: "eth_call",
          params: [{
            to: config.DIVIDEND_CONTRACT_ADDRESS,
            data: `${config.PENDING_REWARD_SELECTOR}${padAddressParam(state.account)}`
          }, "latest"]
        });
        state.claimable = weiHexToTokenAmount(result);
      } catch (error) {
        state.claimable = Number(config.DEMO_CLAIMABLE_FIRE || 0);
      }
    }

    if (
      hasEthereum() &&
      state.account &&
      isAddress(config.DIVIDEND_CONTRACT_ADDRESS) &&
      config.LP_ELIGIBLE_SELECTOR
    ) {
      try {
        const result = await window.ethereum.request({
          method: "eth_call",
          params: [{
            to: config.DIVIDEND_CONTRACT_ADDRESS,
            data: `${config.LP_ELIGIBLE_SELECTOR}${padAddressParam(state.account)}`
          }, "latest"]
        });
        state.hasLp = Boolean(Number(BigInt(result || "0x0")));
      } catch (error) {
        state.hasLp = Boolean(config.DEMO_HAS_LP);
      }
    }

    updateClaimUi();
  }

  async function connectWallet() {
    if (!hasEthereum()) {
      showToast("❌ 未检测到钱包插件，请先安装 MetaMask / OKX Wallet。", "error");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      state.account = accounts[0] || "";
      await switchChainIfNeeded();
      await refreshClaimData();
      updateWalletUi();
    } catch (error) {
      showToast("❌ 冰脉连接失败，请稍后重试。", "error");
    }
  }

  function disconnectWallet() {
    state.account = "";
    state.claimable = Number(config.DEMO_CLAIMABLE_FIRE || 0);
    state.hasLp = Boolean(config.DEMO_HAS_LP);
    updateWalletUi();
    updateClaimUi();
    showToast("熔炉已暂时熄火。", "neutral");
  }

  async function claimReward() {
    if (!state.account) {
      await connectWallet();
      return;
    }

    if (!isAddress(config.DIVIDEND_CONTRACT_ADDRESS)) {
      showToast("❌ 请先在 config.js 填入分红合约地址。", "error");
      return;
    }

    try {
      await switchChainIfNeeded();
      els.claimButton.disabled = true;
      els.claimButton.textContent = "熔炉喷发中...";
      const hash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: state.account,
          to: config.DIVIDEND_CONTRACT_ADDRESS,
          data: config.CLAIM_SELECTOR || "0x4e71d92d"
        }]
      });
      const claimed = state.claimable;
      state.claimable = 0;
      showToast(`✅ 烈焰已至！${claimed.toFixed(4)} 枚火已注入你的钱包。`, "success");
      console.info("claim tx:", hash);
      updateClaimUi();
      window.setTimeout(refreshClaimData, 6000);
    } catch (error) {
      showToast("❌ 熔炉冷却中，请稍后再试。", "error");
      updateClaimUi();
    }
  }

  function tickDashboards() {
    buybackSeconds -= 1;
    dividendSeconds -= 1;
    if (buybackSeconds <= 0) {
      buybackSeconds = 5 * 60;
      burnedIce += Math.floor(90000 + Math.random() * 220000);
    }
    if (dividendSeconds <= 0) {
      dividendSeconds = 30 * 60;
      remainingFire = Math.max(0, remainingFire - Math.floor(Math.random() * 2));
    }

    els.burnedIce.textContent = burnedIce.toLocaleString("en-US");
    els.buybackCountdown.textContent = formatClock(buybackSeconds);
    els.dividendCountdown.textContent = formatDividendClock(dividendSeconds);
    els.remainingFire.textContent = String(remainingFire);
  }

  function bindEvents() {
    els.walletButton.addEventListener("click", () => {
      if (state.account) disconnectWallet();
      else connectWallet();
    });
    els.claimButton.addEventListener("click", claimReward);
    if (els.qqGroupButton) {
      els.qqGroupButton.addEventListener("click", async () => {
        const groupNumber = config.QQ_GROUP_NUMBER || "1005679043";
        try {
          await navigator.clipboard.writeText(groupNumber);
          showToast(`已复制 QQ 群号：${groupNumber}`, "success");
        } catch (error) {
          showToast(`QQ 群号：${groupNumber}`, "neutral");
        }
      });
    }
    if (els.contractAddressButton) {
      els.contractAddressButton.addEventListener("click", async () => {
        const address = config.DISPLAY_CONTRACT_ADDRESS || "";
        if (!address) return;
        try {
          await navigator.clipboard.writeText(address);
          showToast(`已复制合约地址：${shortAddress(address)}`, "success");
        } catch (error) {
          showToast(`合约地址：${address}`, "neutral");
        }
      });
    }

    if (hasEthereum()) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        state.account = accounts[0] || "";
        updateWalletUi();
        await refreshClaimData();
      });
      window.ethereum.on("chainChanged", async (chainId) => {
        state.chainId = chainId;
        await refreshClaimData();
      });
    }
  }

  async function boot() {
    bindEvents();
    updateWalletUi();
    updateClaimUi();
    tickDashboards();
    window.setInterval(tickDashboards, 1000);

    if (hasEthereum()) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      state.account = accounts[0] || "";
      state.chainId = await window.ethereum.request({ method: "eth_chainId" });
      updateWalletUi();
      await refreshClaimData();
    }
  }

  boot();
})();
