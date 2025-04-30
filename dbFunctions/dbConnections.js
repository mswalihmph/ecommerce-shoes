var db = require('../config/connection');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt')
module.exports = {
    addAdverticement:(data,result)=>{
        db.get().collection('adv').insertOne(data).then((datas)=>{
            result(datas.insertedId)
        })
    },
    getAdverticement:()=>{
        return new Promise(async (resolve,reject)=>{
           let adv=await db.get().collection('adv').find().toArray()
           if(adv){
            resolve(adv)
           }
           else{
            reject('nothing')
           }
        } )
        
    },
    addProduct: (data, result) => {
        db.get().collection('product').insertOne(data).then((datas) => {
            result(datas.insertedId)
        })
    },
    getProduct: () => {
        return new Promise(async (resolve, reject) => {
            let listProduct = await db.get().collection('product').find().toArray()
            resolve(listProduct)
        })
    },
    changeProduct:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection('product').findOne({_id:new ObjectId(prodId)})
            resolve(product)
        })
    },
    addChanges:(product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('product').updateOne({_id:new ObjectId(product.id)},
        {
            $set:{
                pname:product.pname,
                catogory:product.catogory,
                price:product.price,
                discription:product.discription
            }
        })
        resolve('updated')
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
             db.get().collection('product').deleteOne({_id:new ObjectId(prodId)}).then((response)=>{
                    resolve(response)
        })
        })
       
    },
    readAdminData:async (data) => {
            return new Promise(async (resolve, reject) => {
                const user = await db.get().collection('admin').findOne({ email: data.email })
                if (user) {
                    bcrypt.compare(data.password,user.password).then((result) => {
                        if (result) {
                            console.log('the login admin',result)
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
}