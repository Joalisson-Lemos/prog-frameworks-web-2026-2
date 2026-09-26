const { Prisma } = require("@prisma/client");
const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const EmailDuplicadoError = require("../errors/EmailDuplicadoError");
const alunoSchema = require("../schemas/alunoSchema");
const alunoAtualizacaoSchema = alunoSchema.partial();

class AlunoService{

    async findMany(page, pageSize, orderBy, order){
        const [alunos, total] = await Promise.all([
            prisma.aluno.findMany({
                skip: (page-1)*pageSize,
                take: Number(pageSize),
                orderBy: {[orderBy]: order}
            }),
            prisma.aluno.count()
        ]);

        return {alunos, total};
    }

    async findUnique(id){
        const aluno = await prisma.aluno.findUnique({
            where: {id: Number(id)}
        });

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }

    async update(id, aluno){
        if(!aluno || typeof aluno !== "object" || Array.isArray(aluno)){
            // O PUT é parcial, mas precisa receber ao menos um dos campos permitidos.
            throw new AlunoInvalidoError("Informe ao menos um campo válido: nome ou email.");
        }

        const dadosAtualizacao = {};
        if(Object.prototype.hasOwnProperty.call(aluno, "nome") && aluno.nome !== undefined){
            dadosAtualizacao.nome = aluno.nome;
        }
        if(Object.prototype.hasOwnProperty.call(aluno, "email") && aluno.email !== undefined){
            dadosAtualizacao.email = aluno.email;
        }

        if(Object.keys(dadosAtualizacao).length === 0){
            throw new AlunoInvalidoError("Informe ao menos um campo válido: nome ou email.");
        }

        const validacao = alunoAtualizacaoSchema.safeParse(dadosAtualizacao);
        if(!validacao.success){
            throw new AlunoInvalidoError(validacao.error.issues[0].message);
        }

        try{
            return await prisma.aluno.update({
                where: {id: Number(id)},
                data: validacao.data
            });
        }catch(e){
            if(e instanceof Prisma.PrismaClientKnownRequestError){
                if(e.code === "P2025"){
                    throw new AlunoNaoEncontradoError();
                }
                if(e.code === "P2002"){
                    // P2002 indica conflito com o campo único email; 409 representa esse conflito.
                    throw new EmailDuplicadoError();
                }
            }

            throw e;
        }
    }

    async delete(id){
        try{
            return await prisma.aluno.delete({
                where: {id: Number(id)}
            });
        }catch(e){
            if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025"){
                throw new AlunoNaoEncontradoError();
            }

            throw e;
        }
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();
