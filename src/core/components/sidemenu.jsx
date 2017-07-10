import React from "react"
import PropTypes from "prop-types"
import SideMenuItem from "./sidemenuitem";

export default class SideMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
    let configs = this.props.getConfigs();
    this.state = { url: configs.urls[0], selectedIndex: configs.selectedIndex, urls:configs.urls };

    configs.urls.map((obj, index)=>{
        if(this.props.specSelectors.url() === obj.url) {
            this.selectedIndex = index;
        }
    });
  }
  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired
  };

  selectedIndex = 0;

  loadSpec = (index) => {
    let url = this.state.urls[index].url;
    this.props.specActions.updateUrl(url);
    this.props.specActions.download(url);
  }

  downloadUrl = (index, e) => {
  this.selectedIndex = index;
    this.loadSpec(index);
    e.preventDefault()
  }

  render() {
    let {
      specSelectors,
      specActions,
      getComponent,
      layoutSelectors,
      layoutActions,
      authActions,
      authSelectors,
      getConfigs,
      fn
    } = this.props

      let SideMenuItem = getComponent("sidemenuitem", true)

    let taggedOps = specSelectors.taggedOperations()

    const Operation = getComponent("operation")
    const Collapse = getComponent("Collapse")

    let showSummary = layoutSelectors.showSummary()
    let { docExpansion, displayOperationId, displayRequestDuration } = getConfigs();
    return (
        <div className="navigation" id="sidemenu-">
          <ul>
              {
                  this.state.urls.map((url, index)=>{
                    return (
                        <li key={index}><a onClick={(e)=>this.downloadUrl(index,e) }>{url.name}</a>
                           <SideMenuItem selectedIndex={this.selectedIndex} renderIndex={index} />
                        </li>
                    )
                  })
              }
          </ul>
        </div>
    )
  }
}

SideMenu.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
