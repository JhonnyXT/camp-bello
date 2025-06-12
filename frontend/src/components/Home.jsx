import { useState } from 'react';
import safe_box from '../assets/logo-camp.png';
import ButtonIcon from './ButtonIcon';
import Modal from './Modal';
import AddTeamModal from './AddTeamModal';
import BankModal from './BankModal';
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';

const Home = () => {

    const [modalSelected, setModalSelected] = useState(0);
    const [modal, setModal] = useState(false);
    const navigate = useNavigate();

    const [alert, setAlert] = useState({
        type: "",
        msg: ""
    });

    const handleModal = (id) => {
        setModalSelected(id);
        setModal(true);
    };

    const handleNavigate = () => {
        navigate("vault")
    };

    return (
        <>
            <div id="home-page" className="w-full h-full flex justify-center items-center gap-[150px] bg-[#f0f2f5]">
                <img src={safe_box} alt="" width={500} />
                <div className="flex flex-col justify-center items-center shadow-md shadow-neutral-300 p-5 rounded bg-white min-w-[400px]">
                    <h1 className='text-[#263238] text-3xl font-bold'>EMPECEMOS</h1>
                    <div className="flex flex-col items-center w-full gap-2 mt-5">
                        <div className="flex gap-2 w-full">
                            <ButtonIcon eventClick={() => handleModal(1)} icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-plus" width="25" height="25" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                                    <path d="M16 19h6"></path>
                                    <path d="M19 16v6"></path>
                                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
                                </svg>
                            } />
                            <ButtonIcon eventClick={() => handleModal(2)} icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M23 12c0-6.075-4.925-11-11-11S1 5.925 1 12s4.925 11 11 11s11-4.925 11-11M10 8a1 1 0 0 0 0 2h1v5a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1zm6.5 0a2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 0 5 0v-3A2.5 2.5 0 0 0 16.5 8m-.5 2.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0zM8 10a1 1 0 1 0-2 0v1H5a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2H8z" clipRule="evenodd"/></svg>
                            } />
                        </div>
                        <div className='w-full'>
                            <ButtonIcon eventClick={handleNavigate} color='secondary' icon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-crown" width="25" height="25" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"></path>
                                </svg>
                            } />
                        </div>
                    </div>
                </div>
                {
                    modalSelected === 1 ? <Modal modal={modal} setModal={setModal} content={<AddTeamModal setModal={setModal} />} label="Agregar Equipo" />
                        :
                        modalSelected === 2 ? <Modal modal={modal} setModal={setModal} content={<BankModal setModal={setModal} />} label="Gestionar puntos" />
                            :
                            modalSelected === 3 ? <Modal modal={modal} setModal={setModal} content={<AddTeamModal />} label="Agregar Equipo" />
                                :
                                null
                }
            </div >
            {
                alert.msg && <Alert type={alert.type} msg={alert.msg} />
            }
        </>
    )
}

export default Home