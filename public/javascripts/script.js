let curr=0
const slides=document.querySelectorAll('.slider-item')
let length=slides.length
let count =0
const slideInterval=setInterval(()=>{
    
    if(count>=5){
        clearInterval(slideInterval)
    }
    else{
        count++
        nextSlide()
    }
},3000)
function prevSlide(){ 
        curr=curr-1
        if(curr<0){
            curr=length-1
        }
        updateIndicator(curr)
}
function nextSlide(){
    curr=curr+1
    if(curr>=length){
        curr=0
    }
    updateIndicator(curr)
}
function updateIndicator(index){
    slides.forEach(element => {
        element.style.transform=`translateX(-${index*100}%)`
    });
}

function addToCart(evnt){
    fetch('/addToCart/'+evnt,{
        method:"GET"
    }).then((res)=> res.json()).then((msg)=>{
        console.log('the message is',msg)
             if(msg.status){
                    alert('add to cart')
                }
                else{
                    alert('please login ')
                }
    })
}
function changeQuantity(prodId,user,count){
    let quantity=parseInt(document.getElementById(prodId).innerHTML)
    count=parseInt(count)
    fetch('/changeQuantity',{
        method: "POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify({
            prodId:prodId,
            quantity:quantity,
            userId:user,
            count:count
        })
    }).then((res)=> res.json()).then((msg)=>{
        console.log(msg);
        if(msg.removeitem){
               alert('you reemove item from  cart')
               location.reload()
            }
            else{ 
              document.getElementById(prodId).innerHTML=quantity+count
             document.getElementById('total').innerHTML=msg.total
            }
        })
} 
function fileChange(evnt){
    
    let url=URL.createObjectURL(evnt.target.files[0])
    const proxyUrl=new URL(url)
    document.getElementById('pimg').src=proxyUrl.href
}
function fileAdd(evnt){
    let url=URL.createObjectURL(evnt.target.files[0])
    const proxyUrl=new URL(url)
    const img=document.getElementById('addimage')
    img.src=proxyUrl.href
    img.style.display='block'

}