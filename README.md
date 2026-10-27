# 記帳本 · Personal Ledger

本地優先的個人記帳 PWA。資料存在自己的 Google 試算表，透過 Apps Script 同步；
介面與帳本快取都在手機上，打開即用、離線也能記，連線後自動補送。

這個儲存庫只放前端（`index.html`、`sw.js`、`manifest.webmanifest`、圖示）。
後端 `Code.gs` 與 `Index.html` 貼在試算表的 Apps Script 專案裡；
網址與密鑰只存在使用者的裝置上，不在這裡。
