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
    M.cache_sizes = props.cache_sizes;
    M.cache_life = 100000;
    M.cache = { data: null, time: 0 };
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
    window.removeEventListener("resize", M.doColumns);
    M.container.classList.remove("masonryBuilt");
    const genTime = M.cache_sizes ? new Date().getTime() : 0;
    let itemsPrep;
    //
    if (!M.cache.data || genTime - M.cache.time > M.cache_life) {
      console.log("renew", genTime, M.cache.time, M.cache_life);
      itemsPrep = M.items.map((e) => {
        return {
          el: e,
          height: e.getBoundingClientRect().height,
          number: +e.dataset.masonry_index,
        };
      });
      M.cache.data = itemsPrep;
      M.cache.time = genTime;
    } else {
      console.log("cached");
      console.log("cached", genTime, M.cache.time, M.cache_life);
      itemsPrep = M.cache.data;
    }
    itemsPrep.forEach((i) => i.el.remove());
    itemsPrep.sort((a, b) => a.number - b.number);
    const colCount = M.count(); //Math.min(M.count(), M.items.length);
    var virtCols = [];
    for (let i = 0; i < colCount; i++) {
      virtCols.push([]);
    }
    //
    let lengths;
    itemsPrep.forEach((itm) => {
      let [idx, ls] = M.shortest(virtCols);
      lengths = ls;
      // console.log("pushing", itm.el.innerText, "to", idx);
      virtCols[idx].push(itm);
    });
    //
    //find margins

    let mgns = M.margins(lengths);
    console.log(mgns);
    //
    virtCols.forEach((col, colIdx) => {
      col.forEach((item, i, a) => {
        M.container.appendChild(item.el);
        // console.log(item.el, i, a.length);
        item.el.style.removeProperty("margin-bottom"); //marginBottom = "initial";
        if (i == a.length - 1) {
          console.log("break!", i, colIdx, mgns[colIdx]);
          item.el.style.marginBottom = mgns[colIdx] + "px";
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
    // console.log("lengths", lengths, "shortest is", index);
    return [index, lengths];
  },
  margins: function(arr) {
    console.log("MARGINS");
    const my = arr.slice(0);
    my.sort((a, b) => b - a);
    let largest = my[0];
    return arr.map((e) => largest - e);
  },
};
