# Recart on-site methods

These methods are available on the global Recart object via `window._recart`.

### `Public methods`

#### isReady

```typescript
isReady(): boolean
```

#### showOptinTool

```typescript
/*
 * triggers the optin tool to show up (currently only handles popups)
 * @param {string} optinToolId - The id of the optin tool to show
 * @param [options] options - Options
 * @param [options.force] - when force is true it shows the popup even if another popup is already visible
 */
showOptinTool(optinToolId: string, options?: { force: boolean }): void
```

#### getActiveOptinToolInExperiment

```typescript
/*
 * returns the optin tool that has been evaluated active in the experiment
 * @param {string} experimentId - The id of the experiment to query
 * @returns {string | null} returns the id of the evaluated optin tool or returns null when no data found
 */
getActiveOptinToolInExperiment(experimentId: string): string | null
```

#### isSubscriberIdentified

```typescript
/*
 * checks if we have already identified the visitor as a subscriber
 * @returns {boolean} Returns true if the visitor has filled out any of the optin tools
 */
isSubscriberIdentified(): boolean
```

#### hasSubscribedToOptinTool

```typescript
/*
 * checks if the visitor has subscribed to a specific optin tool
 * @param {string} optinToolId - The id of the optin tool to check
 * @returns {boolean} Returns true if the visitor has filled out the specified optin tool
 */
hasSubscribedToOptinTool(optinToolId: string): boolean
```
