const alunoService = require("../services/AlunoService");

class AlunoController{
    
    async findMany(request, response){
        let {page, pageSize, orderBy, order} = request.query;
        page ||= 1;
        pageSize ||= 10;

        const camposOrdenacao = ["id", "nome", "email", "createdAt", "updatedAt"];
        if(!camposOrdenacao.includes(orderBy)){
            orderBy = "id";
        }

        if(typeof order !== "string" || !["asc", "desc"].includes(order.toLowerCase())){
            order = "asc";
        }else{
            order = order.toLowerCase();
        }

        const resultado = await alunoService.findMany(page, pageSize, orderBy, order);
        return response.status(200).json(resultado);
    }

    async findUnique(request, response){
        try{
            const aluno = await alunoService.findUnique(request.params.id);
            return response.status(200).json({aluno});
        }catch(e){
            return response.status(e.statusCode || 500).json({error: e.message});
        }
    }

    async update(request, response){
        try{
            const aluno = await alunoService.update(request.params.id, request.body);
            return response.status(200).json({aluno});
        }catch(e){
            return response.status(e.statusCode || 500).json({error: e.message});
        }
    }

    async create(request, response){
        try{
            const aluno = await alunoService.create(request.body);
            return response.status(201).json({aluno});
        }catch(error){
            return response.status(400).json({error: error.message});
        }
    }

}

module.exports = new AlunoController();
