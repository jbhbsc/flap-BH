window.ICEFIRE_CONFIG = {
  // 填你的分红领取合约地址。留空时页面使用演示数据，不会发链上交易。
  DIVIDEND_CONTRACT_ADDRESS: "",

  // 默认 claim() selector: 0x4e71d92d
  CLAIM_SELECTOR: "0x4e71d92d",

  // 可选：如果合约有 pendingReward(address) 这类读取函数，把 selector 填这里。
  // 注意：selector 只包含函数前 4 字节，app.js 会自动拼接钱包地址参数。
  PENDING_REWARD_SELECTOR: "",

  // 可选：如果合约有 hasLp(address) / eligible(address) 这类读取函数，把 selector 填这里。
  LP_ELIGIBLE_SELECTOR: "",

  CHAIN_ID: "0x38",
  CHAIN_NAME: "BNB Smart Chain",
  RPC_URL: "https://bsc-dataseed.binance.org/",
  EXPLORER_URL: "https://bscscan.com/",

  X_URL: "https://x.com/theawarm12553",
  QQ_GROUP_NUMBER: "1005679043",
  BUY_URL: "https://gmgn.ai/",
  DISPLAY_CONTRACT_ADDRESS: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",

  DEMO_CLAIMABLE_FIRE: "0.0000",
  DEMO_HAS_LP: false
};
