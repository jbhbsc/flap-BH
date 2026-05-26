# 冰火熔炉 DApp

这是一个静态前端 DApp，用于展示和领取「火之 LP 分红」。

## 启动

```bash
npm.cmd start
```

默认访问：

```text
http://127.0.0.1:4176
```

## 配置真实合约

打开 `config.js`：

- `DIVIDEND_CONTRACT_ADDRESS`：分红领取合约地址。
- `CLAIM_SELECTOR`：领取函数 selector，默认是 `claim()` 的 `0x4e71d92d`。
- `PENDING_REWARD_SELECTOR`：可选，可领取数量查询函数 selector。
- `LP_ELIGIBLE_SELECTOR`：可选，LP 持仓资格查询函数 selector。

如果暂时没有合约地址，页面会用演示数据，不会发起链上交易。
