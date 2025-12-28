

interface Props {
    loading: boolean;
    handleDelete: () => void;
    setShow: (data: boolean) => void;
    text: string;
}

export const Modal = ({loading, handleDelete, setShow, text}: Props) => {
    return (
        <>
            <div className="bg-white/70 w-full h-full fixed top-0 left-0 z-10" />
            <div className="h-auto rounded-lg shadow-lg fixed inset-0 z-20 flex justify-center items-center">
                <div className="bg-white w-full mx-10 md:w-1/2 xl:w-1/3 rounded-lg shadow-lg px-5 md:px-10 py-8 text-center">
                    <div className="bg-red-100 p-5 w-fit mx-auto rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-red-600 size-16"
                        >
                            <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                            />
                            <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
                        </svg>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-balance">
                        {text}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 mt-5 text-pretty">
                        Una vez borrado, los datos no se podrán recuperar.
                        Esta acción es irreversible.
                    </p>

                    <div className="flex justify-between gap-x-5 mt-5">
                        <button
                            className="bg-red-600 px-2 py-1 text-white rounded-lg text-lg w-1/2"
                            onClick={handleDelete}
                        >
                            {
                                loading
                                    ? <div role="status" >
                                        <svg aria-hidden="true" className={`text-gray-200 size-5 mx-auto animate-spin fill-red-600`} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.7221 13.2401 69.3739 16.9972C72.401 19.9658 74.6016 23.2765 75.8311 26.8537C77.4089 30.7973 80.3447 33.7792 83.7132 35.0207C86.2544 36.0451 89.3265 35.2483 91.0237 33.2161C92.3681 31.5417 92.4243 28.9206 93.9676 27.6286V39.0409Z" fill="currentFill" />
                                        </svg>
                                    </div>
                                    : "Eliminar"
                            }
                        </button>
                        <button
                            className="bg-gray-300 px-2 py-1 text-gray-800 rounded-lg text-lg w-1/2"
                            onClick={() => setShow(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
