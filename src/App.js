import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import styled from "styled-components";
import "react-calendar/dist/Calendar.css";

// Estiliza o container principal da aplicação.
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px;
`;

// Estiliza o container do calendário.
const CalendarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Estiliza o modal lateral que exibe os processos do mês.
const SideModal = styled.div`
  flex: 0.5;
  margin-left: 20px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  max-height: 40vh;
  overflow-y: auto;
`;

// Estiliza o botão para adicionar novos processos.
const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  right: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
`;

// Estiliza o modal de cadastro de processos.
const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  width: 40%;
`;

// Estiliza o fundo escurecido atrás do modal.
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// Estiliza a barra de busca.
const SearchBar = styled.input`
  margin-bottom: 20px;
  padding: 10px;
  width: 300px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

// Estiliza os tiles do calendário com classes customizadas.
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
  const [processes, setProcesses] = useState([]); // Armazena os processos cadastrados.
  const [modalOpen, setModalOpen] = useState(false); // Controla a visibilidade do modal de cadastro.
  const [formData, setFormData] = useState({
    name: "",
    sendDate: "",
    dueDate: "",
  }); // Armazena os dados do formulário de cadastro.
  const [searchTerm, setSearchTerm] = useState(""); // Armazena o termo digitado na barra de busca.
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Define o mês atualmente exibido no calendário.

  // Atualiza o mês exibido no calendário quando um termo de busca correspondente é encontrado.
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

  // Define classes para os tiles do calendário com base nas datas de validade dos processos.
  const handleDateClass = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    const processOnDate = processes.find((p) => p.dueDate === formattedDate);

    if (!processOnDate) return null;

    const today = new Date().toISOString().split("T")[0];
    const diffDays = (new Date(processOnDate.dueDate) - new Date(today)) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "react-calendar__tile--expired"; // Processos vencidos.
    if (diffDays <= 90) return "react-calendar__tile--attention"; // Processos próximos do vencimento.
    return "react-calendar__tile--valid"; // Processos dentro do prazo.
  };

  // Adiciona um novo processo ou atualiza a data de validade de um processo existente.
  const handleAddProcess = () => {
    const existingProcess = processes.find((p) => p.name === formData.name);
    if (existingProcess) {
      setProcesses((prev) =>
        prev.map((p) =>
          p.name === formData.name ? { ...p, dueDate: formData.dueDate } : p
        )
      );
    } else {
      setProcesses((prev) => [...prev, formData]);
    }
    setModalOpen(false); // Fecha o modal após salvar.
  };

  // Atualiza o estado do mês exibido no calendário.
  const handleMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  // Filtra os processos pelo termo de busca.
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtra os processos para o mês atualmente exibido no calendário.
  const processesInCurrentMonth = filteredProcesses.filter((p) => {
    const dueDate = new Date(p.dueDate);
    return (
      dueDate.getMonth() === currentMonth.getMonth() &&
      dueDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  // Agrupa os processos do mês atual por dia.
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
          onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de busca.
        />
        <CalendarWrapper>
          <Calendar
            value={currentMonth}
            tileClassName={handleDateClass} // Aplica classes customizadas nos dias do calendário.
            onActiveStartDateChange={handleMonthChange} // Atualiza o mês exibido.
          />
        </CalendarWrapper>
        <AddButton onClick={() => setModalOpen(true)}>+</AddButton> {/* Abre o modal de cadastro. */}
      </CalendarContainer>

      <SideModal>
        <h3>Processos do Mês</h3>
        {Object.keys(groupedByDay).length === 0 ? (
          <p>Nenhum processo neste mês.</p> // Exibe mensagem caso não haja processos.
        ) : (
          Object.entries(groupedByDay).map(([day, processesForDay], index) => (
            <div key={index}>
              <strong>Dia {parseInt(day, 10)}:</strong>
              {processesForDay.map((process, i) => (
                <p key={i}>
                  <span>{process.dueDate}</span> - {process.name}
                </p>
              ))}
            </div>
          ))
        )}
      </SideModal>

      {modalOpen && (
        <>
          <Backdrop onClick={() => setModalOpen(false)} /> {/* Fecha o modal ao clicar no fundo. */}
          <Modal>
            <h3>Cadastro de Processo</h3>
            <input
              type="text"
              placeholder="Nome do Processo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} // Atualiza o nome do processo.
            />
            <input
              type="date"
              placeholder="Data de Envio"
              value={formData.sendDate}
              onChange={(e) => setFormData({ ...formData, sendDate: e.target.value })} // Atualiza a data de envio.
            />
            <input
              type="date"
              placeholder="Data de Validade"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value }) // Atualiza a data de validade.
              }
            />
            <button onClick={handleAddProcess}>Salvar</button> {/* Salva o processo. */}
          </Modal>
        </>
      )}
    </Container>
  );
};

export default App;
