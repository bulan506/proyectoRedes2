import React from 'react';
import { Modal, Button } from 'react-bootstrap'; // Importa el modal desde donde sea necesario

interface ModalComponentProps {
  showModal: boolean;
  handleCloseModal: () => void;
  modalMessage: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ showModal, handleCloseModal, modalMessage }) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>Warning</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalComponent;
