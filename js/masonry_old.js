window.masonry = {

  colsNow: 0,

  init: function(p){
    const M = window.masonry;
    if(document.readyState=="loading")
    {
      window.addEventListener("DOMContentLoaded" , ()=>M.setup(p) )
    }else{
      M.setup(p)
    }
  },

  setup: function(props){ 
     console.info("Init Masonry...")
     const M = window.masonry;
     if(!props.container){ return }
     M.childSelector = props.children || props.container + " > *";
     M.columnClass = props.columnClass || "col" 
     M.count = props.countFn ? ()=>props.countFn(M.container) : ()=>2 
     M.bySize = props.bySize || false; //find container
     M.container =   document.querySelector(props.container);
     if(!M.container){ console.info("no container found") ; return }
     M.container.classList.add( "masonryWatched");
     //gather childs
     M.items = Array.from( M.container.querySelectorAll(M.childSelector) );
     //add listener
     window.addEventListener("resize", M.doColumns)

     if(props.bySize){
       //we have to rebuild columns after complete load
       window.addEventListener("load" , ()=>M.doColumns(true));
     }
     M.doColumns();
  },

  doColumns: function(force){
     const M = window.masonry;
     //how many columns do we need?
     const cn = Math.min( M.count() , M.items.length);
     if(cn==M.colsNow && !force){ return; }
     //start working
     window.removeEventListener("resize", M.doColumns)
     M.container.classList.remove("masonryBuilt");
     console.info("required columns:" , cn)
     var colElements =  new Array() ;
    for( el = 0 ; el < cn ; el++ ){
          const i = document.createElement("div");
          i.setAttribute("class" , M.columnClass);
          colElements.push(i)
          }


     if (!M.bySize || M.items.length <=cn){
     //simple split algorithm
     //count lengths of columns
     //shortest 
       const shrt = Math.floor( M.items.length/cn );
       //remainder (number of longer columns)
       const cleft = M.items.length - ( shrt * cn );

       for ( i = 0 ; i < cn ; i++ ){

         const thisColLength = shrt + ( i < cleft ? 1 : 0 )
         for( y = 0 ; y < thisColLength ; y++ ){
           colElements[i].appendChild( M.items[ i + (y*cn ) ]  )
         }     
       }
       //append
       M.container.innerHTML = "";
       colElements.forEach( e=>M.container.appendChild(e) );
     }else{
       //by size algorithm
       M.container.innerHTML = "";
       colElements.forEach(e=>M.container.appendChild(e));

       function getShortest(){
         const lengths =  colElements.map(
           c=>{
              const childs = c.childNodes;
              let l = 0;
              childs.forEach( c=>{
                l += c.getBoundingClientRect().height;
              } )
              return l;
           }
         );
         return colElements[ lengths.indexOf( Math.min( ...lengths ) ) ]
       }//return shortest col

       M.items.forEach( item=>{
           getShortest().appendChild(item);
       } )
     }
     M.colsNow = cn;
     M.container.classList.add("masonryBuilt");
     //throttle
     window.setTimeout(()=>{ 
        window.addEventListener("resize", M.doColumns);
        M.doColumns();
        } , 300)
  }
}
