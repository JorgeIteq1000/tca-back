const { Pessoa, Documento, Ocorrencia, Certificado, NotaFalta, Requerimento, Matricula, Financeiro } = require('../models');

const buscarTudoController = {
  // Buscar todos os dados de uma pessoa em todos os módulos
  async buscarTodosDados(req, res) {
    try {
      const { busca } = req.query;
      
      if (!busca) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca é obrigatório'
        });
      }

      let codPessoa;
      let nomePessoa;

      // Primeiro, identificar a pessoa
      if (!isNaN(busca)) {
        // Se é um número, buscar por código
        codPessoa = parseInt(busca);
        const pessoa = await Pessoa.buscarPorCodigo(codPessoa);
        if (pessoa.data.length > 0) {
          nomePessoa = pessoa.data[0].nome;
        }
      } else {
        // Se é texto, buscar por nome e pegar o primeiro resultado
        const pessoas = await Pessoa.buscarPorNome(busca, 1, 1);
        if (pessoas.data.length > 0) {
          codPessoa = pessoas.data[0].cod_pessoa;
          nomePessoa = pessoas.data[0].nome;
        }
      }

      if (!codPessoa) {
        return res.status(404).json({
          success: false,
          message: 'Pessoa não encontrada'
        });
      }

      // Buscar dados em todos os módulos
      const resultados = {};

      try {
        // Dados pessoais
        const dadosPessoais = await Pessoa.buscarPorCodigo(codPessoa);
        resultados.pessoa = dadosPessoais.data;
      } catch (error) {
        console.error('Erro ao buscar dados pessoais:', error);
        resultados.pessoa = [];
      }

      try {
        // Documentos
        const documentos = await Documento.buscarPorPessoa(codPessoa, 1, 50);
        resultados.documento = documentos.data;
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        resultados.documento = [];
      }

      try {
        // Ocorrências
        const ocorrencias = await Ocorrencia.buscarPorPessoa(codPessoa, 1, 50);
        resultados.ocorrencia = ocorrencias.data;
      } catch (error) {
        console.error('Erro ao buscar ocorrências:', error);
        resultados.ocorrencia = [];
      }

      try {
        // Certificados
        const certificados = await Certificado.buscarPorPessoa(codPessoa, 1, 50);
        resultados.certificado = certificados.data;
      } catch (error) {
        console.error('Erro ao buscar certificados:', error);
        resultados.certificado = [];
      }

      try {
        // Notas/Faltas
        const notasFaltas = await NotaFalta.buscarPorPessoa(codPessoa, 1, 50);
        resultados.notafalta = notasFaltas.data;
      } catch (error) {
        console.error('Erro ao buscar notas/faltas:', error);
        resultados.notafalta = [];
      }

      try {
        // Requerimentos
        const requerimentos = await Requerimento.buscarPorPessoa(codPessoa, 1, 50);
        resultados.requerimento = requerimentos.data;
      } catch (error) {
        console.error('Erro ao buscar requerimentos:', error);
        resultados.requerimento = [];
      }

      try {
        // Matrículas
        const matriculas = await Matricula.buscarPorPessoa(codPessoa, 1, 50);
        resultados.matricula = matriculas.data;
      } catch (error) {
        console.error('Erro ao buscar matrículas:', error);
        resultados.matricula = [];
      }

      // Financeiro (apenas para admin)
      if (req.user && req.user.role === 'admin') {
        try {
          const financeiro = await Financeiro.buscarPorPessoa(codPessoa, 1, 50);
          resultados.financeiro = financeiro.data;
        } catch (error) {
          console.error('Erro ao buscar dados financeiros:', error);
          resultados.financeiro = [];
        }
      }

      // Calcular totais
      const totais = {
        pessoa: resultados.pessoa.length,
        documento: resultados.documento.length,
        ocorrencia: resultados.ocorrencia.length,
        certificado: resultados.certificado.length,
        notafalta: resultados.notafalta.length,
        requerimento: resultados.requerimento.length,
        matricula: resultados.matricula.length,
        financeiro: resultados.financeiro ? resultados.financeiro.length : 0
      };

      res.json({
        success: true,
        data: {
          cod_pessoa: codPessoa,
          nome_pessoa: nomePessoa,
          modulos: resultados,
          totais: totais,
          total_geral: Object.values(totais).reduce((acc, val) => acc + val, 0)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar todos os dados:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = buscarTudoController;

