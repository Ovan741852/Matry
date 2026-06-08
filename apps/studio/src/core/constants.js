(function attachConstants(namespace) {
  namespace.modeLabels = {
    text: "用文字生成",
    frames: "首幀到尾幀生成",
    reference: "參考圖生成",
    import: "匯入影片",
  };

  namespace.palette = [
    ["#27150e", "#b45309"],
    ["#080808", "#b7791f"],
    ["#111827", "#d4a017"],
    ["#0f172a", "#be123c"],
    ["#123026", "#e8752c"],
  ];
})(window.MatryStudio = window.MatryStudio || {});
