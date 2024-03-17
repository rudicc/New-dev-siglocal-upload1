
var i =0;

const init =()=>{
 
    debugger

    let vhtmlpage = '';
    let vhtmlimglist = '';
    let listDataImg64 = [];  
    let pdfinput = document.querySelector(".selectpdf");
    let pwd = document.querySelector(".pwd");
    let upload = document.querySelector(".upload");
    let afterupload = document.querySelector(".afterupload");
    let trcss = document.querySelector(".trcss");
    let downloadcss = document.querySelector(".downloadcss");
    let download = document.querySelector(".download");

     document.getElementById("prog").style.display='none';
  
    
    let pdftext = document.querySelector(".pdftext");
    upload.addEventListener('click', async ()=>{
        let file = pdfinput.files[0];
        if (file != undefined && file.type == "application/pdf") {
            let fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => {
                let res = fr.result;
                if (pwd.value == "") {
                    extractText(res, false);
                } else {
                    extractText(res, true);
                }

            }
        } else {
            alert("select a valid pdf file");
        }
    });
    async function extractText(url, pass) {
        debugger
        let txt = '';
        let pdf;
  
        document.getElementById("prog").style.display='block';
     
            if (pass) {
                pdf = await pdfjsLib.getDocument(
                    {
                        url: url,
                        password: pwd.value
                    }
                ).promise;
            } else {
                pdf = await pdfjsLib.getDocument(url).promise;
            }

        //console.log(pdf);

        let pages = pdf.numPages;
        let j= parseInt(100/pages);
        // if(pages<100){
        //     j = parseInt(100/pages);
        // }else{
        //     j = parseInt(pages/100);
        // }
       

        //document.querySelector("progress-bar").style.display='none';
        var bar = document.querySelector(".progress-bar");
        bar.ariaValueMax = 100;
        bar.ariaValueMin =0; 
         
        for (let i = 1; i <= pages; i++) {

             
            /*** get Text */
            let page = await pdf.getPage(i);
            let txt = await page.getTextContent();
            let text = txt.items.map((s)=>s.str).join("");
            console.log(text);

            /** page */

            pdf.getPage(i).then(page => {
                //console.log(page)

                let pdfimg = document.createElement("img")
                let pdfcanvas = document.createElement("canvas")
                let context = pdfcanvas.getContext("2d")
                let pageViewPort = page.getViewport({ scale: 1 })
                //console.log(pageViewPort)
                
                pdfcanvas.width = pageViewPort.width
                pdfcanvas.height = pageViewPort.height
                pdfcanvas.id = "canvas" + i;
                page.render({
                    canvasContext: context,
                    viewport: pageViewPort
                })
                //####Div            
                listDataImg64.push({
                    id:i,
                    listDataImg64: pdfcanvas,
                    pageWidth: pageViewPort.width,
                    pageHeight: pageViewPort.height,
                    pageTxt: page.getTextContent()
                });
    
                document.getElementById("pdfView").append(pdfcanvas);
                                                              
                //$("#pdfView").append(pdfcanvas);
                               
                SetdataURL(i , pdfcanvas);

       

            }).catch(pageErr => {
                console.log(pageErr);
            })

            if(j>0){
                 //bar.style.width = (j) +"%";
                 bar.innerText = (j) +"%";           
            }

     
            if( i == pages  ){
                //bar.style.min.width = 100 + "%";
                bar.innerText = 100 + "%";

                alert('File Success!');

                document.getElementById("prog").style.display='none';
            }
            j = j+1;

        }
    }
  
    async function SetdataURL(i, pdfcanvas){
        try{
            const dataURL = await pdfcanvas.toDataURL();
             trcss.append([' ']);
             trcss.append([` #img${i} { display: block; margin-top: 180px; width: 950px; height: 850px; background-color: hwb(0 90% 10%); transition: background-color 300ms; background-image: url("${dataURL}"); }`]);
             
        }catch(err){
            console.log(err)
        }
    }

    document.querySelector(".download").addEventListener('click' , async () =>{
        debugger
        let _c = listDataImg64.length; 
        if(_c > 0 ){
            if(WritePageHTM(_c)){
                alert('เขียนไฟล์เรียบร้อยแล้ว!');   
            }            
        }else{
                alert('ไม่สามารถสร้างไฟล์เข้ารหัสรูปภาพ กรุณาตรวจสอบข้อมูลหรืออัพโหลดข้อมูล ไฟล์ PDF!');  
        }

    })

    document.querySelector(".downloadcss").addEventListener('click' , async () =>{
        WriteCanvasTo_CSS();
    })
    async function WriteCanvasTo_CSS(){
        debugger
        try{

            let _c = listDataImg64.length; 
            let  dataList = '\n';
            let  dataListjson = '\n';
            const  el = document.createElement("div");
            for (let i = 1; i < _c; i++) {
                var name = `canvas${i}`;
                const cav  = document.getElementById(name);
                const dataURL = cav.toDataURL(); 
           
                dataList += `\n#img${i} \n {\n display: block; \n margin-top: 180px; \n width: 950px; \n height: 850px; \n background-color: hwb(0 90% 10%); \n transition: background-color 300ms; \n background-image: url(\n "${dataURL}" \n ); \n} \n`;
                
            }
       
            if(dataList.length>0){ 
                downloadcss.href="data:text/css;charset=utf-8," + encodeURIComponent(dataList); 

                alert('เขียนไฟล์เรียบร้อยแล้ว!');   
            }else{
                alert('ไม่สามารถเข้ารหัสไฟล์ได้กรุณาลองทำใหม่อีกครั้ง!')
            }
                    
        }catch(err){
            console.log(err)
        }
    }
 
    async function WriteDIVPageHTM(_c){
        vhtmlpage ='';
        debugger
        try{    
            
            let remainder = (_c%2);
            if(remainder>0){ _c++;}
            let _p = (_c/2);
            for (let i = 1; i <= _p; i++) {
               
                let bimg =i*2;

                let aimg =bimg-1;


                if(i>1){
                    //
                    vhtmlpage +=`
            
                    <!-- Paper ${i}-->
                    <div id="p${i}" class="paper">
                        <div class="front">
                            <div id="f${i}" class="front-content">                                     
                                <div class="book-img" id="img${aimg}">
                            
                                </div>
                            </div>
                        </div>
                        <div class="back">
                            <div id="b${i}" class="back-content">                                     
                                <div class="book-img" id="img${bimg}">
                            
                                </div>
                            </div>
                        </div>
                    </div>

            `;
                }else{
                    //
                    vhtmlpage +=`
                        
                            <!-- Paper ${i}-->
                            <div id="p${i}" class="paper">
                                <div class="front">
                                    <div id="f${i}" class="front-content">                                     
                                        <div class="book-img" id="img${i}">
                                    
                                        </div>
                                    </div>
                                </div>
                                <div class="back">
                                    <div id="b${i}" class="back-content">                                     
                                        <div class="book-img" id="img${bimg}">
                                    
                                        </div>
                                    </div>
                                </div>
                            </div>

                    `;                    
                }

      

            }
            for (let i = 1; i <= _c; i++) {

                this.vhtmlimglist += `\n        <link rel="stylesheet" href="./img-${i}.css" /> \n`;
                
            }

          
        }catch(err){
            console.log(err);           
        }
        return vhtmlpage;

    }
    //gen page
    async function WritePageHTM(_c){
        debugger
        let _f = true;
        try
        {

            let remainder = (_c%2);
            if(remainder>0){ _c++;}
            let _p = (_c/2);

         let  dataList = WriteDIVPageHTM(_c);
         let vhtml =`

            <!DOCTYPE html>
            <html lang="en">
              <head>
                    <meta charset="UTF-8" />    
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>GCPO Filp Book</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js" integrity="sha512-57oZ/vW8ANMjR/KQ6Be9v/+/h6bq9/l3f0Oc7vn6qMqyhvPd1cvKBRWWpzu0QoneImqr2SkmO4MSqU+RpHom3Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
                   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css" integrity="sha512-ELV+xyi8IhEApPS/pSj66+Jiw+sOT1Mqkzlh8ExXihe4zfqbWkxPRi8wptXIO9g73FSlhmquFlUOuMSoXz5IRw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            
                    <link  rel="stylesheet" href="../rung-dev.css" />
                    <script src="../rung-dev.js" defer="script" ></script>
                     
    
              </head>
            <body>
                <style id="addpage"></style>
                <div id="vdatacss"></div> 
            
            <input id="vcount" value="${_p}" hidden="{true}" /> 
            <input id="vmaxcount" value="${_c}" hidden="{true}" /> 
 
            <div class="menulist">
                <ul>    
                    <li><button id="btnp"><i class="fa-solid fa-caret-left"></i></button></li>            
                    <li><input  id="vpanum" value=""  /></li>
                    <li><button id="btnn"><i class="fa-solid fa-caret-right"></i></button></li>

                    <li hidden="hidden"><button id="zoomin"><i class="fa-solid fa-magnifying-glass-plus"></i></button></li>
                    <li hidden="hidden"><button id="zoomout"><i class="fa-solid fa-magnifying-glass-minus"></i></button></li>
                       
                </ul>
             </div>

            <div class="vbody" style="resize:both; overflow:auto;">
                
                <!-- Previous button-->
                <div tyle="resize:both; overflow:auto;">
                    <button id="prev-btn" class="ibtn">
                        <i class="fas fa-arrow-alt-circle-left"></i>
                    </button>            
                </div>
            
                <!-- Book -->
                <div id="book" class="book">
                  <div id="ebook"></div>                                                                       
                </div>
               <!-- end Book -->
                        
                <!-- Next button overflow:auto;-->
                    <div style="resize:both;"> 
                        <button id="next-btn" class="ibtn">
                        <i class="fas fa-arrow-alt-circle-right"></i>
                    </button>       
                </div>
            </div>
            
            </body>
            </html>
            
            
         `;

        //  var a = document.createElement("a");
        //     a.href = "myfile.png";
        //     a.download = document.getElementById("myName").value;
        //     document.body.appendChild(a);
        //     a.click();
        //  document.body.removeChild(a);

      
         download.href="data:text/html;charset=utf-8," + encodeURIComponent(vhtml); 
        }catch(err){
            console.log(err);
            _f = false;
        }
        return _f;
    }
}

window.onload = init();