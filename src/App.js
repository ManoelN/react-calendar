import React, { useState, useEffect } from "react"; // Importa React e os hooks useState e useEffect.
import Calendar from "react-calendar"; // Importa o componente de calendário.
import styled from "styled-components"; // Importa styled-components para estilização.
import "react-calendar/dist/Calendar.css"; // Importa os estilos padrão do calendário.

// Estilização do container principal.
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
`;

// Estilização do container do calendário.
const CalendarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Estilização do painel lateral que exibe os processos do mês.
const SideModal = styled.div`
  flex: 0.5;
  margin-left: 20px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-height: 40vh;
  overflow-y: auto; // Permite rolagem caso os conteúdos ultrapassem a altura.
`;

// Botão flutuante para adicionar novos processos.
const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%; // Torna o botão circular.
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  position: fixed;
  bottom: 20px; // Posição fixa no canto inferior direito.
  right: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); // Sombra para destacar.
`;

// Modal que aparece ao adicionar um processo.
const Modal = styled.div`
  position: fixed;
  top: 50%; // Centraliza verticalmente.
  left: 50%; // Centraliza horizontalmente.
  transform: translate(-50%, -50%); // Ajusta para o centro exato.
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000; // Garante que o modal esteja acima de outros elementos.
  width: 40%;
`;

// Fundo escurecido atrás do modal.
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); // Transparência para o fundo.
  z-index: 999; // Menor que o modal.
`;

// Barra de busca para encontrar processos pelo nome.
const SearchBar = styled.input`
  margin-bottom: 20px;
  padding: 10px;
  width: 300px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

// Estilização customizada para o calendário.
const CalendarWrapper = styled.div`
  .react-calendar__tile--valid {
    background: green !important;
    color: white;
  }
  .react-calendar__tile--attention {
    background: yellow !important;
    color: black;
  }
  .react-calendar__tile--expired {
    background: red !important;
    color: white;
  }
`;

const App = () => {
  const [processes, setProcesses] = useState([]); // Lista de processos.
  const [modalOpen, setModalOpen] = useState(false); // Estado do modal.
  const [formData, setFormData] = useState({
    name: "",
    sendDate: "",
    dueDate: "",
    pdfFile: null,
  }); // Dados do formulário para adicionar processos.
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca.
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Mês exibido no calendário.

  // Efeito para ajustar o calendário ao buscar processos.
  useEffect(() => {
    if (searchTerm.trim()) {
      const matchingProcess = processes.find((process) =>
        process.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingProcess) {
        const dueDate = new Date(matchingProcess.dueDate);
        setCurrentMonth(new Date(dueDate.getFullYear(), dueDate.getMonth(), 1));
      }
    }
  }, [searchTerm, processes]);

  // Função para definir classes customizadas para as datas no calendário.
  const handleDateClass = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0]; // Formata a data.
    const processOnDate = processes.find((p) => p.dueDate === formattedDate);

    if (!processOnDate) return null; // Sem processos na data.

    const today = new Date().toISOString().split("T")[0];
    const diffDays = (new Date(processOnDate.dueDate) - new Date(today)) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "react-calendar__tile--expired"; // Vencido.
    if (diffDays <= 90) return "react-calendar__tile--attention"; // Atenção.
    return "react-calendar__tile--valid"; // Válido.
  };

  // Adiciona ou atualiza um processo.
  const handleAddProcess = () => {
    const existingProcess = processes.find((p) => p.name === formData.name);
    if (existingProcess) {
      setProcesses((prev) =>
        prev.map((p) =>
          p.name === formData.name ? { ...p, dueDate: formData.dueDate, pdfFile: formData.pdfFile } : p
        )
      );
    } else {
      setProcesses((prev) => [...prev, formData]);
    }
    setModalOpen(false); // Fecha o modal.
  };

  // Atualiza o mês exibido ao navegar no calendário.
  const handleMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  // Filtra os processos com base no termo de busca.
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtra processos para o mês atual.
  const processesInCurrentMonth = filteredProcesses.filter((p) => {
    const dueDate = new Date(p.dueDate);
    return (
      dueDate.getMonth() === currentMonth.getMonth() &&
      dueDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  // Agrupa processos por dia.
  const groupedByDay = processesInCurrentMonth.reduce((acc, process) => {
    const day = process.dueDate.split("-")[2];
    if (!acc[day]) acc[day] = [];
    acc[day].push(process);
    return acc;
  }, {});

  return (
    <Container>
      <CalendarContainer>
        <SearchBar
          type="text"
          placeholder="Buscar processos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CalendarWrapper>
          <Calendar
            value={currentMonth}
            tileClassName={handleDateClass}
            onActiveStartDateChange={handleMonthChange}
          />
        </CalendarWrapper>
        <AddButton onClick={() => setModalOpen(true)}>+</AddButton>
      </CalendarContainer>

      <SideModal>
        <h3>Processos do Mês</h3>
        {Object.keys(groupedByDay).length === 0 ? (
          <p>Nenhum processo neste mês.</p>
        ) : (
          Object.entries(groupedByDay).map(([day, processesForDay], index) => (
            <div key={index}>
              <strong>Dia {parseInt(day, 10)}:</strong>
              {processesForDay.map((process, i) => (
                <p key={i}>
                  <span>{process.dueDate}</span> - {process.name}
                  {process.pdfFile && (
                    <a href={URL.createObjectURL(process.pdfFile)} target="_blank" rel="noopener noreferrer">
                      (Visualizar PDF)
                    </a>
                  )}
                </p>
              ))}
            </div>
          ))
        )}
      </SideModal>

      {modalOpen && (
        <>
          <Backdrop onClick={() => setModalOpen(false)} />
          <Modal>
            <h3>Cadastro de Processo</h3>
            <input
              type="text"
              placeholder="Nome do Processo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="date"
              placeholder="Data de Envio"
              value={formData.sendDate}
              onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })}
            />
            <input
              type="date"
              placeholder="Data de Validade"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFormData({ ...formData, pdfFile: e.target.files[0] })}
            />
            <button onClick={handleAddProcess}>Salvar</button>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default App; // Exporta o componente principal.
