var express = require('express');
var router = express.Router();
var OperaController = require('../controllers/operas');

/* GET /operas e GET /operas?genre=GGGG */
router.get('/operas', function(req, res) {
    if (req.query.genre) {
        OperaController.listarPorGenero(req.query.genre)
            .then(dados => res.jsonp(dados))
            .catch(erro => res.status(500).jsonp({ erro: erro.message }));
    } else {
        OperaController.listar()
            .then(dados => res.jsonp(dados))
            .catch(erro => res.status(500).jsonp({ erro: erro.message }));
    }
});

/* GET /cantores */
router.get('/cantores', function(req, res) {
    OperaController.listarCantores()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

/* GET /teatros */
router.get('/teatros', function(req, res) {
    OperaController.listarTeatros()
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

/* GET /operas/:id */
router.get('/operas/:id', function(req, res) {
    OperaController.procurarPorId(req.params.id)
        .then(dados => {
            if (dados) res.jsonp(dados);
            else res.status(404).jsonp({ erro: "Ópera não encontrada" });
        })
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

/* POST /operas */
router.post('/operas', function(req, res) {
    OperaController.inserir(req.body)
        .then(dados => res.status(201).jsonp(dados))
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

/* PUT /operas/:id */
router.put('/operas/:id', function(req, res) {
    OperaController.alterar(req.params.id, req.body)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

/* DELETE /operas/:id */
router.delete('/operas/:id', function(req, res) {
    OperaController.remover(req.params.id)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).jsonp({ erro: erro.message }));
});

module.exports = router;