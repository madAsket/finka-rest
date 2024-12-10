
const defineHooks = (db)=>{
    db.Storage.addHook('afterCreate', async (storage, options) => {
        //TODO Add currencyrate for storage.
    
        console.log("ADDING CURRENCY RATE FOR STORAGE:", storage.id)
        const project = await db.Project.findOne({
        where:{
            id:storage.projectId
        }
        })
        if(project.currency !== storage.currency){
            db.CurrencyRate.findOrCreate({
            where: { 
                fromCurrency: storage.currency,
                toCurrency: project.currency
            },
            });
        }
    });
}

module.exports = defineHooks;