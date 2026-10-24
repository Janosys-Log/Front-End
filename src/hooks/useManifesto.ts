import { useCallback, useEffect, useState } from "react";
import useUsuario from "./useUsuario";

export default function useManifesto() {
  const [manifestoIds, setManifestoIds] = useState<number[]>([]);
  const { session } = useUsuario();

  const fetchManifestosIds = useCallback(async () => {
    const response = await fetch(`http://localhost:8083/api/manifestos`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    if (!response.ok)
      return;

    const responseJson: Array<{ idManifesto: number }> = await response.json();
    const ids = responseJson.map((m: { idManifesto: number }) => m.idManifesto);
    setManifestoIds(ids);
  }, [session.token]);

  useEffect(() => {
    fetchManifestosIds();
  }, [fetchManifestosIds]);

  return { manifestoIds };
}
