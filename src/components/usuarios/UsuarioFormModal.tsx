import type { FormEvent } from "react";
import type { Papel, Perfil, Usuario, UsuarioPayload } from "../../types/usuario";
import { useState } from "react";
import { z } from "zod";
import { PAPEIS_POR_PERFIL, PAPEL_LABEL, PERFIL_LABEL } from "../../constants/usuario";
import { atualizarUsuario, criarUsuario } from "../../services/usuario.service";
import Modal from "../common/Modal";

type Props = {
  usuario: Usuario | null; // null = criação
  onClose: () => void;
  onSaved: (usuario: Usuario, mensagem: string) => void;
};

type Campos = {
  nome: string;
  email: string;
  senha: string;
  login: string;
  perfil: Perfil;
  papel: Papel;
};

type Erros = Partial<Record<keyof Campos, string>>;

function montarSchema(edicao: boolean) {
  const senha = edicao
    ? z.string().refine(v => v === "" || (v.length >= 8 && v.length <= 72), "A senha deve ter entre 8 e 72 caracteres.")
    : z.string().min(8, "A senha deve ter no mínimo 8 caracteres.").max(72, "A senha deve ter no máximo 72 caracteres.");

  return z.object({
    nome: z.string().trim().min(1, "Informe o nome.").max(100, "O nome deve ter no máximo 100 caracteres."),
    email: z.email("Informe um e-mail válido.").max(150, "O e-mail deve ter no máximo 150 caracteres."),
    senha,
    login: z.string().trim().min(1, "Informe o usuário (login).").max(50, "O usuário deve ter no máximo 50 caracteres."),
    perfil: z.enum(["GERENCIA", "OPERACIONAL"]),
    papel: z.enum(["GERENTE_OPERACIONAL", "LIDER", "OPERADOR_LOGISTICO", "SAC"]),
  });
}

export default function UsuarioFormModal({ usuario, onClose, onSaved }: Props) {
  const edicao = usuario !== null;

  const [campos, setCampos] = useState<Campos>({
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    senha: "",
    login: usuario?.login ?? "",
    perfil: usuario?.perfil ?? "OPERACIONAL",
    papel: usuario?.papel ?? PAPEIS_POR_PERFIL.OPERACIONAL[0],
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroServidor, setErroServidor] = useState("");
  const [salvando, setSalvando] = useState(false);

  function alterar<K extends keyof Campos>(campo: K, valor: Campos[K]) {
    setCampos(atual => ({ ...atual, [campo]: valor }));
  }

  function alterarPerfil(perfil: Perfil) {
    // cascata: ao trocar o perfil, o papel volta ao primeiro papel válido dele
    setCampos(atual => ({ ...atual, perfil, papel: PAPEIS_POR_PERFIL[perfil][0] }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErroServidor("");

    const resultado = montarSchema(edicao).safeParse(campos);
    if (!resultado.success) {
      const novos: Erros = {};
      for (const issue of resultado.error.issues) {
        const chave = issue.path[0] as keyof Campos;
        novos[chave] ??= issue.message;
      }
      setErros(novos);
      return;
    }
    setErros({});

    const payload: UsuarioPayload = {
      nome: resultado.data.nome,
      email: resultado.data.email,
      login: resultado.data.login,
      perfil: resultado.data.perfil,
      papel: resultado.data.papel,
    };
    if (resultado.data.senha !== "")
      payload.senha = resultado.data.senha; // na edição, só envia se preenchida

    setSalvando(true);
    try {
      const salvo = edicao ? await atualizarUsuario(usuario.id, payload) : await criarUsuario(payload);
      onSaved(salvo, edicao ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.");
    }
    catch (err) {
      setErroServidor(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
    finally {
      setSalvando(false);
    }
  }

  return (
    <Modal title={edicao ? "Editar usuário" : "Novo usuário"} onClose={onClose}>
      <form onSubmit={enviar} className="form-grid">
        {erroServidor && <p className="msg-erro">{erroServidor}</p>}

        <label className="form-field">
          Nome
          <input value={campos.nome} onChange={e => alterar("nome", e.target.value)} />
          {erros.nome && <span className="field-error">{erros.nome}</span>}
        </label>

        <label className="form-field">
          E-mail
          <input value={campos.email} onChange={e => alterar("email", e.target.value)} />
          {erros.email && <span className="field-error">{erros.email}</span>}
        </label>

        <label className="form-field">
          Usuário (login)
          <input value={campos.login} onChange={e => alterar("login", e.target.value)} />
          {erros.login && <span className="field-error">{erros.login}</span>}
        </label>

        <label className="form-field">
          {edicao ? "Nova senha (em branco mantém a atual)" : "Senha"}
          <input
            type="password"
            autoComplete="new-password"
            value={campos.senha}
            onChange={e => alterar("senha", e.target.value)}
          />
          {erros.senha && <span className="field-error">{erros.senha}</span>}
        </label>

        <div className="form-row">
          <label className="form-field">
            Perfil
            <select value={campos.perfil} onChange={e => alterarPerfil(e.target.value as Perfil)}>
              {(Object.keys(PERFIL_LABEL) as Perfil[]).map(p => (
                <option key={p} value={p}>{PERFIL_LABEL[p]}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            Papel
            <select value={campos.papel} onChange={e => alterar("papel", e.target.value as Papel)}>
              {PAPEIS_POR_PERFIL[campos.perfil].map(p => (
                <option key={p} value={p}>{PAPEL_LABEL[p]}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
