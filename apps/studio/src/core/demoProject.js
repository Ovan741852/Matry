(function attachDemoProject(namespace) {
  function createDemoProject() {
    return {
      id: crypto.randomUUID(),
      title: "可樂短廣告",
      aspectRatio: "9:16",
      style: "商業廣告",
      shots: [
        namespace.createShot("瓶蓋打開", 2, "frames", "手指旋開冰涼可樂瓶蓋，瓶口冒出第一道氣泡。", 0, "done"),
        namespace.createShot("氣泡噴出", 4, "frames", "大量氣泡從瓶口噴出，慢動作，水珠飛濺，背景為深色攝影棚。", 1, "generating"),
        namespace.createShot("結尾標語", 3, "text", "可樂瓶站在冰塊上，畫面出現醒目標語，最後定格成廣告主視覺。", 2, "done"),
      ],
    };
  }

  namespace.createDemoProject = createDemoProject;
})(window.MatryStudio = window.MatryStudio || {});
