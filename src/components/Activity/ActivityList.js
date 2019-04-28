import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { springs, theme } from '@aragon/ui'
import { Transition, animated } from 'react-spring'
import { AppType } from '../../prop-types'
import { addressesEqual } from '../../web3-utils'
import ActivityItem from './ActivityItem'
import IconEmptyState from './IconEmptyState'

const getAppByProxyAddress = (proxyAddress, apps) =>
  apps.find(app => addressesEqual(app.proxyAddress, proxyAddress)) || null

const ActivityList = React.memo(({ apps, activities, clearActivity }) => {
  const [activitiesReady, setActivitiesReady] = React.useState({})

  const activityItems = useMemo(
    () =>
      activities
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(activity => ({
          ...activity,
          app: getAppByProxyAddress(activity.targetAppProxyAddress, apps),
        })),
    [activities, apps]
  )

  const transitionKeys = activity => activity.transactionHash

  return (
    <div css="position: relative">
      <Transition
        native
        items={activityItems.length === 0}
        from={{ opacity: 0 }}
        enter={{ opacity: 1 }}
        leave={{ opacity: 0 }}
        config={springs.smooth}
      >
        {show =>
          show &&
          (transitionStyles => (
            <div
              css={`
                position: absolute;
                top: 0;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 64px 32px 24px;
              `}
              style={transitionStyles}
            >
              <IconEmptyState />
              <p
                css={`
                  margin-top: 10px;
                  font-size: 14px;
                  color: ${theme.textSecondary};
                `}
              >
                No activity.
              </p>
            </div>
          ))
        }
      </Transition>
      <Transition
        native
        items={activityItems}
        keys={transitionKeys}
        trail={100}
        initial={{
          opacity: 1,
          height: 'auto',
          transform: 'translate3d(0px, 0, 0)',
        }}
        from={{
          opacity: 0,
          height: 0,
          transform: 'translate3d(-20px, 0, 0)',
        }}
        enter={item => async next => {
          await next({
            opacity: 1,
            height: 'auto',
            transform: 'translate3d(0px, 0, 0)',
          })
          const activityKey = transitionKeys(item)
          setActivitiesReady({ ...activitiesReady, [activityKey]: true })
        }}
        leave={{
          opacity: 0,
          height: 0,
          transform: 'translate3d(-20px, 0, 0)',
        }}
        config={springs.smooth}
      >
        {activity => transitionStyles => (
          <animated.div style={{ ...transitionStyles, overflow: 'hidden' }}>
            <ActivityItem
              activity={activity}
              onClose={() => {
                clearActivity(activity.transactionHash)
              }}
            />
          </animated.div>
        )}
      </Transition>
    </div>
  )
})

ActivityList.propTypes = {
  apps: PropTypes.arrayOf(AppType).isRequired,
  activities: PropTypes.arrayOf(PropTypes.object).isRequired,
  clearActivity: PropTypes.func.isRequired,
}

export default ActivityList
