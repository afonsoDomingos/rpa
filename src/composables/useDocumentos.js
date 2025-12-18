import { ref } from 'vue';
import api from '../api';

export function useDocumentos() {
    const documentosDisponiveis = ref([]);
    const documentosReportados = ref([]);
    const documentosProprietarios = ref([]);
    const documentosEncontrados = ref([]);
    const loading = ref(false);
    const error = ref(null);

    const buscarDocumentos = async () => {
        loading.value = true;
        try {
            const response = await api.get('/documentos');
            documentosDisponiveis.value = response.data;
        } catch (err) {
            console.error('Erro ao buscar documentos:', err);
            error.value = err;
        } finally {
            loading.value = false;
        }
    };

    const buscarDocumentosReportados = async () => {
        try {
            const response = await api.get('/documentos/reportados');
            documentosReportados.value = response.data;
        } catch (err) {
            console.error('Erro ao buscar documentos reportados:', err);
        }
    };

    const buscarDocumentosProprietarios = async () => {
        try {
            const response = await api.get('/documentos/proprietarios');
            documentosProprietarios.value = response.data;
        } catch (err) {
            console.error('Erro ao buscar documentos proprietários:', err);
        }
    };

    const procurarDocumento = async (params) => {
        loading.value = true;
        try {
            const response = await api.get('/documentos', { params });
            documentosEncontrados.value = response.data;
            return response.data;
        } catch (err) {
            console.error('Erro ao procurar documentos:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const cadastrarDocumento = async (novoDocumento) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado.');

        return await api.post('/documentos', novoDocumento, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return {
        documentosDisponiveis,
        documentosReportados,
        documentosProprietarios,
        documentosEncontrados,
        loading,
        error,
        buscarDocumentos,
        buscarDocumentosReportados,
        buscarDocumentosProprietarios,
        procurarDocumento,
        cadastrarDocumento
    };
}
