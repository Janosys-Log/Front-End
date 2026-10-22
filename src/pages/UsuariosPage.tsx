import type { Usuario } from "../types/usuario";
import { Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import UsuarioFormModal from "../components/usuarios/UsuarioFormModal";
import { PAPEL_LABEL, PERFIL_LABEL } from "../constants/usuario";
import useUsuario from "../hooks/useUsuario";
import { ApiError, ativarUsuario, desativarUsuario, listarUsuarios } from "../services/usuario.service";
import "../styles/usuarios.css";

type ModalState = { aberto: boolean; usuario: Usuario | null };

export default function UsuariosPage() {
  const { session, logout } = useUsuario();
  const ehGerente = session.role === "gerente";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modal, setModal] = useState<ModalState>({ aberto: false, usuario: null });
  const [aDesativar, setADesativar] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!ehGerente)
      return;

    let ativo = true;
    listarUsuarios()
      .then((dados) => {
        if (ativo)
          setUsuarios(dados);
      })
      .catch((err) => {
        if (!ativo)
          return;
        if (err instanceof ApiError && err.status === 401)
          logout(); // token expirado/inválido: volta ao login
        else
          setErro(err instanceof Error ? err.message : "Erro inesperado.");
      })
      .finally(() => {
        if (ativo)
          setCarregando(false);
      });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react/exhaustive-deps -- logout muda a cada render; a lista só deve carregar quando o perfil mudar
  }, [ehGerente]);

  if (!ehGerente) {
    return (
      <div className="usuarios-col">
        <p className="msg-erro">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  function aoSalvar(salvo: Usuario, mensagem: string) {
    setUsuarios((lista) => {
      const existe = lista.some(u => u.id === salvo.id);
      return existe ? lista.map(u => (u.id === salvo.id ? salvo : u)) : [...lista, salvo];
    });
    setSucesso(mensagem);
    setErro("");
    setModal({ aberto: false, usuario: null });
  }

  function pedirAlternancia(u: Usuario) {
    if (u.ativo)
      setADesativar(u); // desativar pede confirmação
    else
      void executarAlternancia(u); // reativar é direto
  }

  async function executarAlternancia(u: Usuario) {
    setErro("");
    setSucesso("");
    setADesativar(null);

    try {
      const atualizado = u.ativo ? await desativarUsuario(u.id) : await ativarUsuario(u.id);
      setUsuarios(lista => lista.map(x => (x.id === atualizado.id ? atualizado : x)));
      setSucesso(u.ativo ? "Usuário desativado." : "Usuário reativado.");
    }
    catch (err) {
      if (err instanceof ApiError && err.status === 401)
        logout();
      else
        setErro(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  return (
    <div className="usuarios-col">
      <div className="usuarios-header">
        <h2>Usuários</h2>
        <button className="btn-primary" onClick={() => setModal({ aberto: true, usuario: null })}>
          <Plus size={14} />
          Novo usuário
        </button>
      </div>

      {sucesso && <p className="msg-sucesso">{sucesso}</p>}
      {erro && <p className="msg-erro">{erro}</p>}

      <div className="usuarios-table-wrap">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Papel</th>
              <th>Situação</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr><td colSpan={6} className="usuarios-empty">Carregando...</td></tr>
            )}
            {!carregando && usuarios.length === 0 && (
              <tr><td colSpan={6} className="usuarios-empty">Nenhum usuário encontrado.</td></tr>
            )}
            {usuarios.map((u) => {
              const propria = u.id === session.idUsuario;
              const bloqueado = u.ativo && (propria || u.primario);
              const dica = propria
                ? "Você não pode desativar a sua própria conta."
                : "O usuário primário não pode ser desativado.";

              return (
                <tr key={u.id}>
                  <td>
                    {u.nome}
                    {u.primario && <span className="tag-primario">PRIMÁRIO</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>{PERFIL_LABEL[u.perfil]}</td>
                  <td>{u.papel ? PAPEL_LABEL[u.papel] : "—"}</td>
                  <td className={u.ativo ? "situacao-ativo" : "situacao-inativo"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        title="Editar"
                        onClick={() => setModal({ aberto: true, usuario: u })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title={bloqueado ? dica : u.ativo ? "Desativar" : "Reativar"}
                        disabled={bloqueado}
                        onClick={() => pedirAlternancia(u)}
                      >
                        {u.ativo ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal.aberto && (
        <UsuarioFormModal
          usuario={modal.usuario}
          onClose={() => setModal({ aberto: false, usuario: null })}
          onSaved={aoSalvar}
        />
      )}
      {aDesativar && (
        <Modal title="Desativar usuário" onClose={() => setADesativar(null)}>
          <p className="modal-copy">
            Desativar o usuário "
            {aDesativar.nome}
            "? Ele não conseguirá mais entrar, mas o registro será mantido.
          </p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setADesativar(null)}>Cancelar</button>
            <button className="btn-primary" onClick={() => executarAlternancia(aDesativar)}>Desativar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
