import { useRef } from "react";

const Modal = ({ content, modal, setModal, label }) => {

    const modalRef = useRef(null);

    const handleBackgroundClick = (e) => {
        if (e.target === modalRef.current) {
            setModal(false);
        }
    };
    return (
        <>
            {modal && (
                <>
                    <div
                        ref={modalRef} // Ref al div del modal
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        onMouseDown={handleBackgroundClick} // Manejador de clic en el fondo oscuro
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                            <div className="bg-white rounded min-w-[500px]">
                                <div className='flex justify-between items-center px-5 py-2 border-b'>
                                    <h1 className="text-neutral-700 font-medium text-xl">{label}</h1>
                                    <button onClick={() => setModal(false)} className="hover:bg-neutral-100 transition p-2 rounded-lg grid place-content-center text-neutral-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M18 6l-12 12"></path>
                                            <path d="M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div>

                                    {/* Contenido del modal */}
                                    {content}

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-20 fixed inset-0 z-40 bg-black"></div>
                </>
            )}
        </>
    )
}

export default Modal