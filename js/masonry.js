window.masonry = {
  colsNow: 0,

  init: function(p) {
    const M = window.masonry;
    if (document.readyState == "loading") {
      window.addEventListener("DOMContentLoaded", () => M.setup(p));
    } else {
      M.setup(p);
    }
  },

  setup: function(props) {
    console.info("Init Masonry...");
    const M = window.masonry;
    if (!props.container) {
      return;
    }
    M.childSelector = props.children || props.container + " > *";
    M.count = props.countFn ? () => props.countFn(M.container) : () => 3;
    M.container = document.querySelector(props.container);
    if (!M.container) {
      console.info("no container found");
      return;
    }
    M.container.classList.add("masonryWatched");
    //gather childs
    M.items = Array.from(M.container.querySelectorAll(M.childSelector));
    M.items.forEach((e, i) => {
      e.dataset.masonry_index = i;
    });
    //add listener
    window.addEventListener("resize", M.doColumns);
    window.addEventListener("load", M.doColumns);

    M.doColumns();
  },

  doColumns: function() {
    const M = window.masonry;
    const itemsPrep = M.items.map((e) => {
      return {
        el: e,
        height: e.getBoundingClientRect().height,
        number: +e.dataset.masonry_index,
      };
    });
    itemsPrep.forEach((i) => i.el.remove());
    itemsPrep.sort((a, b) => a.number - b.number);
    const colCount = Math.min(M.count(), M.items.length);
    window.removeEventListener("resize", M.doColumns);
    M.container.classList.remove("masonryBuilt");
    var virtCols = [];
    for (let i = 0; i < colCount; i++) {
      virtCols.push([]);
    }
    //
    itemsPrep.forEach((itm) => {
      let idx = M.shortest(virtCols);
      console.log("pushing", itm.el.innerText, "to", idx);
      virtCols[idx].push(itm);
    });
    virtCols.forEach((col) => {
      col.forEach((elitm, i, a) => {
        M.container.appendChild(elitm.el);
        console.log(elitm.el, i, a.length);
        elitm.el.style.marginBottom = "1rem";
        if (i == a.length - 1) {
          console.log("break!");
          elitm.el.style.marginBottom = "10rem";
        }
      });
    });
    console.log(virtCols);
    M.container.style.columnCount = colCount;
    M.container.classList.add("masonryBuilt");
    //throttle
    window.setTimeout(() => {
      window.addEventListener("resize", M.doColumns);
    }, 300);
  },
  shortest: function(arr, msg) {
    const lengths = arr.map((inner) =>
      inner.reduce((a, e) => {
        // console.log(e, e.height);
        a += e.height;
        return a;
      }, 0),
    );
    let index = 0;
    let shortestL = lengths[index];
    lengths.forEach((l, i) => {
      if (l < shortestL) {
        shortestL = l;
        index = i;
      }
    });
    console.log("lengths", lengths, "shortest is", index);
    return index;
  },
};
