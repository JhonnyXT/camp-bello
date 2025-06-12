import { useState } from 'react';
import safe_box from '../assets/logo-camp.png';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './Modal';
import AddTeamModal from './AddTeamModal';
import BankModal from './BankModal';

const Home = () => {
    const [modalSelected, setModalSelected] = useState(0);
    const [modal, setModal] = useState(false);
    const navigate = useNavigate();

    const handleModal = (id) => {
        setModalSelected(id);
        setModal(true);
    };

    const handleNavigate = () => {
        navigate("vault");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                    <div className="w-full lg:w-1/2 animate-fade-in">
                        <img 
                            src={safe_box} 
                            alt="Logo" 
                            className="w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    
                    <Card className="w-full lg:w-1/2 max-w-md animate-slide-in">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                ¡EMPECEMOS!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Gestiona tus equipos y puntos
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="primary"
                                    onClick={() => handleModal(1)}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                                        <path d="M16 19h6"></path>
                                        <path d="M19 16v6"></path>
                                        <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
                                    </svg>
                                    Agregar Equipo
                                </Button>
                                
                                <Button
                                    variant="secondary"
                                    onClick={() => handleModal(2)}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" fillRule="evenodd" d="M23 12c0-6.075-4.925-11-11-11S1 5.925 1 12s4.925 11 11 11s11-4.925 11-11M10 8a1 1 0 0 0 0 2h1v5a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1zm6.5 0a2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 0 5 0v-3A2.5 2.5 0 0 0 16.5 8m-.5 2.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0zM8 10a1 1 0 1 0-2 0v1H5a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2H8z" clipRule="evenodd"/>
                                    </svg>
                                    Gestionar Puntos
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleNavigate}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"></path>
                                </svg>
                                Ver Puntos
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {modalSelected === 1 && (
                <Modal 
                    modal={modal} 
                    setModal={setModal} 
                    content={<AddTeamModal setModal={setModal} />} 
                    label="Agregar Equipo" 
                />
            )}
            
            {modalSelected === 2 && (
                <Modal 
                    modal={modal} 
                    setModal={setModal} 
                    content={<BankModal setModal={setModal} />} 
                    label="Gestionar puntos" 
                />
            )}
        </div>
    );
};

export default Home;