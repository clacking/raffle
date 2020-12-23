import NoIMG from '../assets/noimg.png';

export const GameList = ({games}) => {
    return (
        <div className="flex flex-col m-4 border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100 max-w-screen-xl gameBox overflow-auto">
            <h3 className="font-black text-xl italic text-center">GIFT</h3>
            {
                games.map(n =>
                    <div className="flex flex-col text-center">
                        <h4 className="border-t">Group {n[0]}</h4>
                        <div className="flex flex-row flex-wrap justify-center">
                        {
                            n[1].length >= 1 ?
                                n[1].map( g => (
                                    <div className="p-2 rounded-md w-60 shadow p-2 m-2 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white">
                                        <p><img className="h-20 m-auto" src={g.img || NoIMG} /></p>
                                        <p className="overflow-ellipsis">{g.name} by {g.by}</p>
                                    </div>
                                ))
                            : <p>ないよ</p>
                        }
                        </div>
                    </div>
                )
            }
        </div>
    )
}