
import './App.css';
import { BrowserRouter as Router,
  Route,
  Switch,
  Redirect
 } from "react-router-dom";
 import{v4 as uuidV4} from 'uuid';
 import  TextEditor from './TextEditor';

function App() {
  return (
   
    <Router>
      <Switch>
        <Route path='/' exact>
        <Redirect to={`/document/${uuidV4()}`}></Redirect>

        </Route>
        <Route path='/document/:id' exact> 
            <TextEditor/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
