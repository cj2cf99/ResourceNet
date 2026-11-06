# 主站页级辅助区兼容修复 · 2026-11-06

用户要求修复个人提醒遮挡星图管理台的问题。来源基线0f05232cf41517df235479a68b245dec7cfca8cf。

manage.html仅增加空的page-auxiliary槽及条件CSS：空槽不改变独立管理台；有辅助内容时，让辅助区和业务三栏按文档流排列，保留业务区域自身高度，长表单通过页面滚动呈现。没有新留言业务、事件监听或数据写入，留言仍由主站共享组件负责。

先执行npm.cmd test，9/9通过；再使用本机独立Chrome验证来源HTML/CSS，1440/768/375px各自测试空槽、260px、650px辅助内容，无交叠、无横向溢出。之后只将这段CSS与槽同步主站public/mynet/manage.html，未全量覆盖其它来源差异。主站tests/helpers/self-notes-regressions.cjs额外验证实际留言/长表单三屏宽以及品牌不交叠。

不独立部署本子项目，无数据库/配置变更。尚未进行代码提交/push，随主站获准部署流程处理；线上Access效果待用户截图。主站最终状态见G:/cloudflare/myapp/RELEASE_REVIEW.md最新修复节。
