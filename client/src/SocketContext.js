import React from 'react';

const SocketContext = React.createContext(null); 

// export class SocketProvider extends React.Component {

//     render() {

//         return (
//             <SocketContext.Provider value={this.props.socket}>
//                 {this.props.children}
//             </SocketContext.Provider>
//         );
//     }
// }

export default SocketContext;