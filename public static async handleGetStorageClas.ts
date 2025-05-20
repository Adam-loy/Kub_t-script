    public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        try{

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    } 