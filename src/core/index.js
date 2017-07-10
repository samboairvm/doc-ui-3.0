import deepExtend from "deep-extend"

import System from "core/system"
import win from "core/window"
import ApisPreset from "core/presets/apis"
import * as AllPlugins from "core/plugins/all"
import { parseSeach, filterConfigs } from "core/utils"

const CONFIGS = [ "url", "urls", "urls.primaryName", "spec", "validatorUrl", "onComplete", "onFailure", "authorizations", "docExpansion",
    "apisSorter", "operationsSorter", "supportedSubmitMethods", "dom_id", "defaultModelRendering", "oauth2RedirectUrl",
    "showRequestHeaders", "custom", "modelPropertyMacro", "parameterMacro", "displayOperationId" , "displayRequestDuration"]

// eslint-disable-next-line no-undef
const { GIT_DIRTY, GIT_COMMIT, PACKAGE_VERSION } = buildInfo

module.exports = function SwaggerUI(opts) {

  win.versions = win.versions || {}
  win.versions.swaggerUi = `${PACKAGE_VERSION}/${GIT_COMMIT || "unknown"}${GIT_DIRTY ? "-dirty" : ""}`;

  const urls = [
    {name:'Account Management',url:'https://api.airsembly-staging.com/accountManagement/Swagger.json', apikeyName:'airvm-token'},
    {name:'Payment Gateway',url:'https://api.airsembly-staging.com/paymentGateway/swagger.json',apikeyName:'airvm-token'},
    {name:'Service Offering',url:'https://api.airsembly-staging.com/serviceOfferings/swagger.json',apikeyName:'airvm-token'},
    {name:'vCloud Automator',url:'https://api.airsembly-staging.com/automators/vcloud/swagger.json',apikeyName:'airvm-token'},
    // {name:'Audit',url:'https://api.airsembly-staging.com/audit/swagger.json',apikeyName:'airvm-token'}
  ];

  const defaults = {
    // Some general settings, that we floated to the top
    dom_id: null,
    spec: {},
    url: 'https://api.airsembly-staging.com/accountManagement/Swagger.json',
    urls: urls,
    layout: "BaseLayout",
    docExpansion: "list",
    validatorUrl: "https://online.swagger.io/validator",
    configs: {},
    custom: {},
    displayOperationId: false,
    displayRequestDuration: false,

    // Initial set of plugins ( TODO rename this, or refactor - we don't need presets _and_ plugins. Its just there for performance.
    // Instead, we can compile the first plugin ( it can be a collection of plugins ), then batch the rest.
    presets: [
    ],

    // Plugins; ( loaded after presets )
    plugins: [
    ],

    // Inline Plugin
    fn: { },
    components: { },
    state: { },

    // Override some core configs... at your own risk
    store: { },
  }

  const constructorConfig = deepExtend({}, defaults, opts)

  const storeConfigs = deepExtend({}, constructorConfig.store, {
    system: {
      configs: constructorConfig.configs
    },
    plugins: constructorConfig.presets,
    state: {
      layout: {
        layout: constructorConfig.layout
      },
      spec: {
        spec: "",
        url: constructorConfig.url
      }
    }
  })

  let inlinePlugin = ()=> {
    return {
      fn: constructorConfig.fn,
      components: constructorConfig.components,
      state: constructorConfig.state,
    }
  }

  var store = new System(storeConfigs)
  store.register([constructorConfig.plugins, inlinePlugin])

  var system = store.getSystem()
  let queryConfig = parseSeach()

  system.initOAuth = system.authActions.configureAuth

  const downloadSpec = (fetchedConfig) => {
    if(typeof constructorConfig !== "object") {
      return system
    }

    let localConfig = system.specSelectors.getLocalConfig ? system.specSelectors.getLocalConfig() : {}
    let mergedConfig = deepExtend({}, localConfig, constructorConfig, fetchedConfig || {}, queryConfig)
    store.setConfigs(filterConfigs(mergedConfig, CONFIGS))

    if (fetchedConfig !== null) {
      if (!queryConfig.url && typeof mergedConfig.spec === "object" && Object.keys(mergedConfig.spec).length) {
        system.specActions.updateUrl("")
        system.specActions.updateLoadingStatus("success")
        system.specActions.updateSpec(JSON.stringify(mergedConfig.spec))
      } else if (system.specActions.download && mergedConfig.url) {
        system.specActions.updateUrl(mergedConfig.url)
        system.specActions.download(mergedConfig.url)
      }
    }

    if(mergedConfig.dom_id) {
      system.render(mergedConfig.dom_id, "App")
    } else {
      console.error("Skipped rendering: no `dom_id` was specified")
    }

    return system
  }

  let configUrl = queryConfig.config || constructorConfig.configUrl

  if (!configUrl || !system.specActions.getConfigByUrl || system.specActions.getConfigByUrl && !system.specActions.getConfigByUrl(configUrl, downloadSpec)) {
    return downloadSpec()
  }

  return system
}

// Add presets
module.exports.presets = {
  apis: ApisPreset,
}

// All Plugins
module.exports.plugins = AllPlugins
