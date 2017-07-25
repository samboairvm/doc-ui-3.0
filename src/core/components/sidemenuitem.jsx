import React from "react"
import PropTypes from "prop-types"
import SideMenuService from "./sidemenumodel";

export default class SideMenuItem extends React.Component {
    constructor(props, context) {
        super(props, context);
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

  setTag = function(tag){
        SideMenuService.tag = tag;
    }

  setOperation = function(id){
    SideMenuService.operationid = id;
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
            fn,
            selectedIndex,
            renderIndex
        } = this.props

        let taggedOps = specSelectors.taggedOperations()

        const Operation = getComponent("operation")
        const Collapse = getComponent("Collapse")

        let showSummary = layoutSelectors.showSummary()
        let { docExpansion, displayOperationId, displayRequestDuration } = getConfigs()

        if(this.props.selectedIndex != this.props.renderIndex){
            return (<a></a>)
        }
        return (
              <ul >
                  {
                      taggedOps.map( (tagObj, tag) => {
                          let operations = tagObj.get("operations")
                          let tagDescription = tagObj.getIn(["tagDetails", "description"], null)

                          let isShownKey = ["operations-tag", tag]
                          let showTag = layoutSelectors.isShown(isShownKey, docExpansion === "full" || docExpansion === "list")

                          return (
                              <li key={tag}>
                                <a onClick={this.setTag(tag)}>{tag}</a>
                                <ul className="collapse-" key={tag}>
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
                                                  <a onClick={this.setOperation(op.get("id"))}>{opp.operation.get("summary")}</a>
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
        )
    }
}

SideMenuItem.propTypes = {
    layoutActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    fn: PropTypes.object.isRequired
}
