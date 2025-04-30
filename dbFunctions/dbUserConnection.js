const { ObjectId } = require('mongodb');
var db = require('../config/connection');
const bcrypt = require('bcrypt')
module.exports = {
    AddUserData: (data) => {

        let {
            password,
            cpassword,
            email,
            fname
        } = data
        return new Promise(async (resolve, reject) => {
            if (password === cpassword) {
                password = await bcrypt.hash(password, 10)
                db.get().collection('user').insertOne({
                    Name: fname,
                    Email: email,
                    Password: password
                }).then((datas) => {
                    resolve(datas.insertedId)
                })
            }
            else {
                reject("your password is incorrect")
            }
        })
    },
    readUserData: (data) => {
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection('user').findOne({ Email: data.email })
            if (user) {
                bcrypt.compare(data.password,user.Password).then((result) => {
                    if (result) {

                        resolve(user)
                    }
                    else {

                        reject("your password incorrect")
                    }
                })
            }
            else {

                reject('your email incorrect')
            }

        })
    },
    addToCart: (userId, prodId) => {

        return new Promise(async (resolve, reject) => {
            const UId = new ObjectId(userId)
            const PId = new ObjectId(prodId)
            let prodObj = { prodId: PId, quantity: 1 }
            const user = await db.get().collection('userCart').findOne({ userId: UId })
            if (user) {
                let proIndex = user.products.findIndex(product => product.prodId == prodId)

                if (proIndex != -1) {

                    db.get().collection('userCart').updateOne({ 'products.prodId': PId },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => { resolve() })
                }
                else {

                    db.get().collection('userCart').updateOne({ userId: UId }, {
                        $push: { products: prodObj }
                    }).then(() => {

                        resolve()
                    })
                }
            }
            else {

                let cartObj = {
                    userId: UId,
                    products: [prodObj]
                }
                db.get().collection('userCart').insertOne(cartObj).then(() => { resolve() })
            }
        })
    },
    viewCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            const UId = new ObjectId(userId)
            const user = await db.get().collection('userCart').findOne({ userId: UId })
            if (user) {
                let cartItems = await db.get().collection('userCart').aggregate([
                    {
                        $match: { userId:UId}
                    },
                    {
                        $unwind:'$products'              
                    },
                    {
                        $project:{quantity:'$products.quantity',
                            prodid:'$products.prodId'
                        }
                    },
                    {
                        $lookup: {
                            from:"product",
                            localField:'prodid',
                            foreignField:'_id',
                            as:'products'
                        }
                    },
                    {
                        $project:{
                            prodid:1,
                            quantity:1,
                            products:{$arrayElemAt:['$products',0]}
                        }
                    }            
                ]).toArray()
                resolve(cartItems)

            }
            else {
                reject('no cart')
            }
        })

    },
    changeQuantity:(data)=>{
        return new Promise((resolve,reject)=>{
                   let{
            prodId,
             quantity,
             userId,
            count
        }=data
        count=parseInt(count)
        quantity=parseInt(quantity)
        if(count===-1&&quantity===1){
            db.get().collection('userCart').updateOne({userId:new ObjectId(userId)},{
                $pull:{products:{prodId:new ObjectId(prodId)}}
            }).then((result)=>{
                resolve({removeitem:true})
            })
        }
        else{
             db.get().collection('userCart').updateOne({userId:new ObjectId(userId), 'products.prodId':new ObjectId(prodId) },
            {
                $inc: {'products.$.quantity':count}
            }
        ).then(() => { resolve({status:true})}) 
        }
        })
    },
    totalPrice:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection('userCart').aggregate([
            {
                $match: {userId:new ObjectId(userId)}
            },
            {
                $unwind:'$products'              
            },
            {
                $project:{quantity:'$products.quantity',
                    prodid:'$products.prodId'
                }
            }, 
            {
                $lookup: {
                    from:"product",
                    localField:'prodid',
                    foreignField:'_id',
                    as:'products'
                }
            },
            {
                $project:{
                    prodid:1,
                    quantity:1,
                    products:{$arrayElemAt:['$products',0]}
                }
            },
            {
                $group:{
                    _id:null,
                  total: {$sum:{$multiply:['$quantity',{$toInt:'$products.price'}]}}}
            }            
        ]).toArray()
        resolve(total)
        })
        

    },
    cartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let user= await db.get().collection('userCart').findOne({userId:new ObjectId(userId)})
           console.log(user)
           console.log('above user')
           if(user){
            
                let count=user.products.length
                console.log(count)
            resolve(count)
           }
           else{
            resolve('')
           }
        })
    },
    useProduct:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const userCart=await db.get().collection('userCart').findOne({userId:new ObjectId(userId)})
            const product=userCart.products
            resolve(product)
        })
    },
    placeOrder:(order,product)=>{
        return new Promise((resolve,rejeect)=>{
             const orderDetail={
            userId:order.userId,
            userAddress:{
                address:order.address,
                district:order.district,
                state:order.state,
                pincode:order.pincode,
                number:order.number,
            },
            products:product,
            total:order.total
    }
    db.get().collection('orderList').insertOne(orderDetail).then((result)=>{
        console.log(result)
        resolve(result.insertedId)
    })
        })
       
},
razorpayConnect:(orderId)=>{
    
},
searchData: (data)=>{
    return new Promise(async(resolve,reject)=>{

        const keyword = data
        ? {
            $or: [
              { pname: { $regex: data, $options: "i" } },
              { catogory: { $regex:data, $options: "i" } },
            ],
          }
        : {};

        const product =await db.get().collection('product').find(keyword).toArray()
        console.log('the product of search is ',product)
    resolve(product)
    })   
},
 productDetail: (prodId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection('product').findOne({_id:new ObjectId(prodId)})
            resolve(product)
        })
    },
productQuantity:(userId,prodId)=>{
    return new Promise(async(resolve,reject)=>{  
        
        let userCart=await db.get().collection('userCart').aggregate([{$match:{
            userId:new ObjectId(userId)
        }},{$unwind:"$products"},{$match:{
            "products.prodId":new ObjectId(prodId)
        }}
    ]).toArray()
    console.log(userCart[0])
    if(userCart[0]===undefined){
        console.log('inside')
        resolve(1)
    }
    else{
        
    }
        resolve(userCart[0].products.quantity)
       
    })
}
}
