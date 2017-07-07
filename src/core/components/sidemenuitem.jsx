import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { getList } from "core/utils"
import * as CustomPropTypes from "core/proptypes"

//import "less/opblock"

export default class Operation extends PureComponent {
  static propTypes = {
    path: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    operation: PropTypes.object.isRequired,
    showSummary: PropTypes.bool,

    isShownKey: CustomPropTypes.arrayOrString.isRequired,
    jumpToKey: CustomPropTypes.arrayOrString.isRequired,

    allowTryItOut: PropTypes.bool,

    displayOperationId: PropTypes.bool,
    displayRequestDuration: PropTypes.bool,

    response: PropTypes.object,
    request: PropTypes.object,

    getComponent: PropTypes.func.isRequired,
    authActions: PropTypes.object,
    authSelectors: PropTypes.object,
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    fn: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired
  }

  static defaultProps = {
    showSummary: true,
    response: null,
    allowTryItOut: true,
    displayOperationId: false,
    displayRequestDuration: false
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      tryItOutEnabled: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const defaultContentType = "application/json"
    let { specActions, path, method, operation } = nextProps
    let producesValue = operation.get("produces_value")
    let produces = operation.get("produces")
    let consumes = operation.get("consumes")
    let consumesValue = operation.get("consumes_value")

    if(nextProps.response !== this.props.response) {
      this.setState({ executeInProgress: false })
    }

    if (producesValue === undefined) {
      producesValue = produces && produces.size ? produces.first() : defaultContentType
      specActions.changeProducesValue([path, method], producesValue)
    }

    if (consumesValue === undefined) {
      consumesValue = consumes && consumes.size ? consumes.first() : defaultContentType
      specActions.changeConsumesValue([path, method], consumesValue)
    }
  }

  toggleShown =() => {
    let { layoutActions, isShownKey } = this.props
    layoutActions.show(isShownKey, !this.isShown())
  }

  isShown =() => {
    let { layoutSelectors, isShownKey, getConfigs } = this.props
    let { docExpansion } = getConfigs()

    return layoutSelectors.isShown(isShownKey, docExpansion === "full" ) // Here is where we set the default
  }

  onTryoutClick =() => {
    this.setState({tryItOutEnabled: !this.state.tryItOutEnabled})
  }

  onCancelClick =() => {
    let { specActions, path, method } = this.props
    this.setState({tryItOutEnabled: !this.state.tryItOutEnabled})
    specActions.clearValidateParams([path, method])
  }

  onExecute = () => {
    this.setState({ executeInProgress: true })
  }

  render() {
    let {
      isShownKey,
      jumpToKey,
      path,
      method,
      operation,
      showSummary,
      response,
      request,
      allowTryItOut,
      displayOperationId,
      displayRequestDuration,
      fn,
      getComponent,
      specActions,
      specSelectors,
      authActions,
      authSelectors
    } = this.props

    let summary = operation.get("summary")
    let description = operation.get("description")
    let deprecated = operation.get("deprecated")
    let externalDocs = operation.get("externalDocs")
    let responses = operation.get("responses")
    let security = operation.get("security") || specSelectors.security()
    let produces = operation.get("produces")
    let schemes = operation.get("schemes")
    let parameters = getList(operation, ["parameters"])
    let operationId = operation.get("__originalOperationId")
    let operationScheme = specSelectors.operationScheme(path, method)

    const Responses = getComponent("responses")
    const Parameters = getComponent( "parameters" )
    const Execute = getComponent( "execute" )
    const Clear = getComponent( "clear" )
    const AuthorizeOperationBtn = getComponent( "authorizeOperationBtn" )
    const JumpToPath = getComponent("JumpToPath", true)
    const Collapse = getComponent( "Collapse" )
    const Markdown = getComponent( "Markdown" )
    const Schemes = getComponent( "schemes" )

    // Merge in Live Response
    if(response && response.size > 0) {
      let notDocumented = !responses.get(String(response.get("status")))
      response = response.set("notDocumented", notDocumented)
    }

    let { tryItOutEnabled } = this.state
    let shown = this.isShown()
    let onChangeKey = [ path, method ] // Used to add values to _this_ operation ( indexed by path and method )

    return (
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
    )
  }

}