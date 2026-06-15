const Opera = require('../models/operas');

module.exports = {
    // GET /operas (campos: _id/id, title, premiereYear, compositor.name, teatro.country)
    listar: () => {
        return Opera
            .find({}, { _id: 1, title: 1, premiereYear: 1, "compositor.name": 1, "teatro.country": 1 })
            .exec();
    },

    // GET /operas/:id
    procurarPorId: (id) => {
        return Opera.findOne({ _id: id }).exec();
    },

    // GET /operas?genre=GGGG (campos: _id/id, title, premiereYear)
    listarPorGenero: (genero) => {
        return Opera
            .find({ genre: genero }, { _id: 1, title: 1, premiereYear: 1 })
            .exec();
    },

    // GET /cantores (ordenada alfabeticamente, sem repetições, com lista de óperas associada)
    listarCantores: () => {
        return Opera.aggregate([
            { $unwind: "$cantores" },
            {
                $group: {
                    _id: "$cantores",
                    operas: { $push: { id: "$_id", titulo: "$title" } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    nomeCantor: "$_id",
                    operas: 1
                }
            }
        ]).exec();
    },

    // GET /teatros (ordenada alfabeticamente, sem repetições, país e óperas que estrearam)
    listarTeatros: () => {
        return Opera.aggregate([
            {
                $group: {
                    _id: "$teatro.name",
                    pais: { $first: "$teatro.country" },
                    operas: { $push: { id: "$_id", titulo: "$title" } }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    _id: 0,
                    nomeTeatro: "$_id",
                    pais: 1,
                    operas: 1
                }
            }
        ]).exec();
    },

    // POST /operas
    inserir: (data) => {
        if (data.id && !data._id) data._id = data.id;
        const nova = new Opera(data);
        return nova.save();
    },

    // PUT /operas/:id
    alterar: (id, data) => {
        return Opera.findByIdAndUpdate(id, data, { new: true }).exec();
    },

    // DELETE /operas/:id
    remover: (id) => {
        return Opera.findByIdAndDelete(id).exec();
    }
};