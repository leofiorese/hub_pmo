import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress, Alert 
} from '@mui/material';
import { CheckCircle, Cancel, PersonAdd } from '@mui/icons-material';
import api from '../../../services/api';

export default function Approvals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadPending = async () => {
    try {
      const response = await api.get('/admin/approvals');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approvals/${id}`);
      setFeedback({ type: 'success', message: 'Usuário aprovado e liberado!' });
      loadPending(); // Recarrega a lista
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao aprovar.' });
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Deseja rejeitar e excluir esta solicitação?")) return;
    
    try {
      await api.delete(`/admin/users/${id}`); // Reusa a rota de delete
      setFeedback({ type: 'info', message: 'Solicitação negada e removida.' });
      loadPending();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao rejeitar.' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
            <PersonAdd color="primary" />
            <Typography variant="h6" color="primary">
            Solicitações de Cadastro
            </Typography>
        </Box>

        {feedback.message && (
          <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({type:'', message:''})}>
            {feedback.message}
          </Alert>
        )}

        {loading ? (
           <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : users.length === 0 ? (
           <Typography color="textSecondary" align="center">
             Nenhuma solicitação pendente no momento.
           </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      <IconButton color="success" onClick={() => handleApprove(user.id)} title="Aprovar">
                        <CheckCircle />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleReject(user.id)} title="Negar">
                        <Cancel />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}