import Reflux from 'reflux'

var SidemenuModel = {
  tag: null,
  operationid: null
}

const SideMenuService = Reflux.createStore(SidemenuModel)
export default SideMenuService
