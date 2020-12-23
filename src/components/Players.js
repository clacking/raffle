
export const Players = ({ players }) => {
    return (
        <div className="m-4 border-opacity-60 border border-white shadow rounded-md bg-opacity-30 p-8 bg-gradient-to-r from-blue-200 to-blue-100 gameBox overflow-auto">
            <h1 className="font-black text-xl italic text-center">Players</h1>
            {
                players.map((n, k) => 
                    <p className="font-extralight text-center px-4 py-2 m-2 text-white rounded bg-gradient-to-b from-green-400 to-blue-500 bg-opacity-50" key={k}>
                        {n.roll ? '→ ' : ''}{n.name}
                    </p>
                )
            }
        </div>
    )
}