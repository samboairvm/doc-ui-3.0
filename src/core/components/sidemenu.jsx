import React from "react"
import PropTypes from "prop-types"

export default class SideMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
    let configs = this.props.getConfigs();
    console.log(configs.urls);
    this.state = { url: configs.urls[0], selectedIndex: 0, urls:configs.urls };
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

  loadSpec = () => {
    let url = this.state.urls[this.state.selectedIndex].url;
    this.props.specActions.updateUrl(url);
    this.props.specActions.download(url);
  }

  downloadUrl = (index, e) => {
    this.setState({selectedIndex:index});
    this.loadSpec()
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

    let taggedOps = specSelectors.taggedOperations()

    const Operation = getComponent("operation")
    const Collapse = getComponent("Collapse")

    let showSummary = layoutSelectors.showSummary()
    let { docExpansion, displayOperationId, displayRequestDuration } = getConfigs()

    return (
        <div className="navigation" id="sidemenu">
          <ul>
            <li>
              <a onClick={(e)=>this.downloadUrl(0,e) }>Account</a>
            </li>
            <li>
              <a onClick={(e)=>this.downloadUrl(1,e) }>Service</a>
            </li>
            <li>
              <a onClick={(e)=>this.downloadUrl(2,e) }>Auth</a>
            </li>
          </ul>
          <ul>
            {
              taggedOps.map( (tagObj, tag) => {
                let operations = tagObj.get("operations")
                let tagDescription = tagObj.getIn(["tagDetails", "description"], null)

                let isShownKey = ["operations-tag", tag]
                let showTag = layoutSelectors.isShown(isShownKey, docExpansion === "full" || docExpansion === "list")

                return (
                    <li key={tag}>
                      <a>{tag}</a>
                      <ul>
                    {
                      operations.map( op => {

                        const isShownKey = ["operations", op.get("id"), tag]
                        const path = op.get("path", "")
                        const method = op.get("method", "")
                        const jumpToKey = `paths.${path}.${method}`

                        const allowTryItOut = specSelectors.allowTryItOutFor(op.get("path"), op.get("method"))
                        const response = specSelectors.responseFor(op.get("path"), op.get("method"))
                        const request = specSelectors.requestFor(op.get("path"), op.get("method"))

                        let opp = op.toObject()

                        return(
                        <li key={opp.operation.get("id")}>
                          <a>{opp.operation.get("summary")}</a>
                        </li>)


                      }).toArray()
                    }
                      </ul>
                  </li>
                )
              }).toArray()
            }

            { taggedOps.size < 1 ? <h3> No operations defined in spec! </h3> : null }
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
