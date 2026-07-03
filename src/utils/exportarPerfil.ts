import type { RelatorioProgresso } from '../curriculo/relatorioProgresso'
import type { Tentativa } from '../curriculo/tipos'
import type { PerfilCrianca } from '../firebase/perfis'
import type { ObservacaoSessao } from '../firebase/progresso'
import { nomeArquivoLocalPrivado } from './nomesArquivosPrivados'

export interface ExportacaoPerfil {
  versao: 1
  geradoEm: string
  perfil: PerfilCrianca
  resumo: {
    totalAtividades: number
    totalDominadas: number
    percentualGeral: number
    proximaAtividade: {
      id: string
      moduloId: string
      rotulo: string
    } | null
    revisaoEspacada: {
      id: string
      moduloId: string
      rotulo: string
      diasDesdeUltimaPratica: number | null
    } | null
    modulos: Array<{
      id: string
      titulo: string
      status: string
      dominadasNoModulo: number
      totalAtividades: number
      totalTentativas: number
      percentualAcerto: number | null
      mediaNivelDica: number | null
    }>
  }
  tentativas: Tentativa[]
  observacoesSessao: ObservacaoSessao[]
}

interface CriarExportacaoPerfilParams {
  perfil: PerfilCrianca
  relatorio: RelatorioProgresso
  tentativas: Tentativa[]
  observacoesSessao: ObservacaoSessao[]
  geradoEm: string
}

export function nomeArquivoExportacaoPerfil(
  _perfil: PerfilCrianca,
  data: Date,
): string {
  return nomeArquivoLocalPrivado('dados-perfil', data, 'json')
}

export function criarExportacaoPerfil({
  perfil,
  relatorio,
  tentativas,
  observacoesSessao,
  geradoEm,
}: CriarExportacaoPerfilParams): ExportacaoPerfil {
  return {
    versao: 1,
    geradoEm,
    perfil,
    resumo: {
      totalAtividades: relatorio.totalAtividades,
      totalDominadas: relatorio.totalDominadas,
      percentualGeral: relatorio.percentualGeral,
      proximaAtividade: relatorio.proximaAtividade
        ? {
            id: relatorio.proximaAtividade.id,
            moduloId: relatorio.proximaAtividade.moduloId,
            rotulo: relatorio.proximaAtividade.alvo.rotulo,
          }
        : null,
      revisaoEspacada: relatorio.revisaoEspacada
        ? {
            id: relatorio.revisaoEspacada.atividade.id,
            moduloId: relatorio.revisaoEspacada.atividade.moduloId,
            rotulo: relatorio.revisaoEspacada.atividade.alvo.rotulo,
            diasDesdeUltimaPratica:
              relatorio.revisaoEspacada.diasDesdeUltimaPratica,
          }
        : null,
      modulos: relatorio.resumoPorModulo.map((resumo) => ({
        id: resumo.modulo.id,
        titulo: resumo.modulo.titulo,
        status: resumo.status,
        dominadasNoModulo: resumo.dominadasNoModulo,
        totalAtividades: resumo.totalAtividades,
        totalTentativas: resumo.totalTentativas,
        percentualAcerto: resumo.percentualAcerto,
        mediaNivelDica: resumo.mediaNivelDica,
      })),
    },
    tentativas,
    observacoesSessao,
  }
}
