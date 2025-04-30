const MongoClient=require('mongodb').MongoClient
const state={
    db:null
}



module.exports.connect=function(done){
    const url=;
    const dbname='shopping'
    MongoClient.connect(url).then(
        (client)=>{
            if(!client) return done("error")
            state.db=client.db(dbname)
            done()
        })
}
module.exports.get=function(){
    return state.db
}
