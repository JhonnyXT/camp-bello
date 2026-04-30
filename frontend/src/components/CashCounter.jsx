import { useEffect, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import vault_video from '../assets/contador.mp4'
import cash_counter from '../assets/cash-counter.mp3'
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CashCounter = () => {
    const [showTitle, setShowTitle] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [goBack, setGoBack] = useState(false);
    const [teams, setTeams] = useState([]);

    const navigate = useNavigate();

    const audioRef = useRef(null);

    const animationProps = useSpring({
        to: { height: videoEnded ? '100%' : '0%' },
        from: { height: '0%' },
        config: {
            duration: 3000,
        },
        onRest: () => {
            setShowTitle(true)
        },
    });

    const animationPropsButton = useSpring({
        to: {
            opacity: goBack ? 1 : 0,
            transform: `translateY(${goBack ? 0 : -50}px)`,
        },
        from: {
            opacity: 0,
            transform: 'translateY(-50px)',
        },
        config: {
            duration: 1000,
        }
    });

    const animationPropsTitle = useSpring({
        to: {
            opacity: videoEnded ? 1 : 0,
            transform: `translateY(${videoEnded ? 0 : -50}px)`,
        },
        from: {
            opacity: 0,
            transform: 'translateY(-50px)',
        },
        config: {
            duration: 1000,
        }
    });

    const toggleFullScreen = () => {
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.mozRequestFullScreen) {
                videoWrapper.mozRequestFullScreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }
        }
    };

    const exitFullScreen = () => {
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper.exitFullscreen) {
            videoWrapper.exitFullscreen();
        } else if (videoWrapper.mozCancelFullScreen) {
            videoWrapper.mozCancelFullScreen();
        } else if (videoWrapper.webkitExitFullscreen) {
            videoWrapper.webkitExitFullscreen();
        } else if (videoWrapper.msExitFullscreen) {
            videoWrapper.msExitFullscreen();
        }
    };

    useEffect(() => {
        if (videoEnded) {
            audioRef.current.play();
        }
    }, [videoEnded])

    const handleData = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/teams/rank`);
            setTeams(data);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleData();
        toggleFullScreen();
    }, []);

    if (showTitle) {
        setTimeout(() => {
            setGoBack(true);
            exitFullScreen();
        }, 3000)
    }

    return (
        <div className='video-wrapper' style={{ cursor: goBack ? "default" : "none" }}>
            {
                videoEnded &&
                <animated.h1 style={animationPropsTitle} className='absolute inset-x-0 top-5 text-5xl text-white font-bold text-center'>PUNTAJE EQUIPOS</animated.h1>
            }
            {
                !videoEnded ?
                    <ReactPlayer
                        url={vault_video}
                        onEnded={() => setVideoEnded(true)}
                        playing={true} // Esto hará que el video se reproduzca automáticamente
                        width='100%' // Establece el ancho del reproductor al 100% del contenedor
                        height='100vh' // Establece la altura del reproductor al 100% del viewport (pantalla)
                    />
                    :
                    <div
                        style={{
                            height: '100vh',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            background: "black"
                        }}>
                        <audio ref={audioRef}>
                            <source src={cash_counter} type='audio/mpeg' />
                            Tu navegador no soporta el elemento de audio.
                        </audio>
                        <animated.div className="flex h-[50%] items-end gap-10" style={animationProps}>
                            {teams.map(item => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column-reverse',
                                        height: '80%',
                                        width: '20vw',
                                        textAlign: 'center',
                                    }}>
                                    <div className='rounded' style={{ height: `${item.percent}%`, background: item.color }}></div>
                                    {showTitle ? <p className='text-white text-2xl font-bold'> {Number(item.cash).toLocaleString("en")} <br /><span className='text-md font-semibold px-3 rounded-t pb-1 tracking-wide'>{item.name}</span></p> : <p className='h-[60px]'></p>}
                                </div>
                            ))}
                        </animated.div>
                    </div>
            }
            {goBack &&
                <animated.button onClick={() => navigate("/")} style={animationPropsButton} className='absolute top-5 right-5 text-white bg-green-600 rounded px-5 py-2'>
                    Volver
                </animated.button>
            }
        </div>
    )
}

export default CashCounter;