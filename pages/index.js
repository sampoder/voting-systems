import { Box, Button, Container, Grid } from 'theme-ui'
import { Users, User, Percent } from '@geist-ui/react-icons'
import { results } from '../lib/results'
import { orderBy } from 'lodash'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
const Tooltip = dynamic(() => import('../components/tooltip'), { ssr: false })

function getWindowDimensions() {
  if (typeof window != 'undefined') {
    const { innerWidth: width, innerHeight: height } = window
    return {
      width,
      height,
    }
  }
  return {
    width: 0,
    height: 0,
  }
}

const Named = () => {
  const mainBodyRef = useRef(null)

  useEffect(() => {
    function handleResize() {
      let { width, height } = getWindowDimensions()
      if (window.matchMedia('(max-width: 600px)').matches) {
        mainBodyRef.current.style.marginLeft = `${(width % 33) / 2}px`
        mainBodyRef.current.style.marginRight = `${(width % 33) / 2}px`
      } else {
        mainBodyRef.current.style.marginLeft = `${(width % 66) / 2}px`
        mainBodyRef.current.style.marginRight = `${(width % 66) / 2}px`
      }
    }
    let { width, height } = getWindowDimensions()
    console.log(window.matchMedia('(max-width: 600px)'))
    if (window.matchMedia('(max-width: 600px)').matches) {
      console.log('hello!')
      mainBodyRef.current.style.marginLeft = `${(width % 33) / 2}px`
      mainBodyRef.current.style.marginRight = `${(width % 33) / 2}px`
    } else {
      mainBodyRef.current.style.marginLeft = `${(width % 66) / 2}px`
      mainBodyRef.current.style.marginRight = `${(width % 66) / 2}px`
    }

    window.addEventListener('load', handleResize)
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function main(){
      await sleep(500)
      alert(
        "👋 Hey! This a small experiment showcasing how Australia's parliament (the House of Reps) would look if different electoral voting systems. The approximations are based on the 2019 federal election results. - @sampoder",
      )
    }
    main()
  }, [])

  let finalInstantRunoffResults = {
    'Liberal National Party': 76,
    'Australian Labor Party': 68,
    'The Greens': 1,
    "Katter's Australian Party (KAP)": 1,
    'Centre Alliance': 1,
    Independent: 4,
  }
  let finalFPTPResults = {}
  results.map(x => {
    if (x.Surname == 'Informal') {
    } else {
      if (typeof finalFPTPResults[x.DivisionID] == 'undefined') {
        finalFPTPResults[x.DivisionID] = [x]
      } else {
        finalFPTPResults[x.DivisionID].push(x)
      }
    }
  })
  let finalFPTPPartyResults = {}
  Object.values(finalFPTPResults).map(x => {
    let y = orderBy(x, 'TotalVotes', 'desc')
    if (
      y[0].PartyNm == 'Country Liberals (NT)' ||
      y[0].PartyNm == 'Liberal National Party of Queensland' ||
      y[0].PartyNm == 'The Nationals' ||
      y[0].PartyNm == 'Liberal'
    ) {
      y[0].PartyNm = 'Liberal National Party'
    }
    if (
      y[0].PartyNm == 'Australian Labor Party (Northern Territory) Branch' ||
      y[0].PartyNm == 'Labor'
    ) {
      y[0].PartyNm = 'Australian Labor Party'
    }
    if (y[0].PartyNm.includes('The Greens')) {
      y[0].PartyNm = 'The Greens'
    }
    if (typeof finalFPTPPartyResults[y[0].PartyNm] == 'undefined') {
      finalFPTPPartyResults[y[0].PartyNm] = 1
    } else {
      finalFPTPPartyResults[y[0].PartyNm] += 1
    }
  })
  //console.log(finalFPTPPartyResults)
  let proportionalPartyResults = {}
  results.map(x => {
    if (x.Surname == 'Informal') {
    } else {
      //console.log(x)
      if (
        x.PartyNm == 'Country Liberals (NT)' ||
        x.PartyNm == 'Liberal National Party of Queensland' ||
        x.PartyNm == 'The Nationals' ||
        x.PartyNm == 'Liberal'
      ) {
        x.PartyNm = 'Liberal National Party'
      }
      if (
        x.PartyNm == 'Australian Labor Party (Northern Territory) Branch' ||
        x.PartyNm == 'Labor'
      ) {
        x.PartyNm = 'Australian Labor Party'
      }
      if (x.PartyNm.includes('The Greens')) {
        x.PartyNm = 'The Greens'
      }
      if (typeof proportionalPartyResults[x.PartyNm] == 'undefined') {
        proportionalPartyResults[x.PartyNm] = x.TotalVotes
      } else {
        proportionalPartyResults[x.PartyNm] += x.TotalVotes
      }
    }
  })
  let rankedProportionalPartyResults = orderBy(
    Object.entries(proportionalPartyResults).map(x => ({
      name: x[0],
      votes: x[1],
    })),
    'votes',
    'desc',
  )

  let totalVotes = 0

  rankedProportionalPartyResults.map(x => {
    totalVotes += x.votes
  })

  let totalThresholdVotes = 0

  rankedProportionalPartyResults.map(x => {
    if (x.votes / totalVotes > 0.00) {
      totalThresholdVotes += x.votes
    }
  })

  let finalProportionalPartyResults = {}

  rankedProportionalPartyResults.map(x => {
    if (x.votes / totalVotes > 0.05) {
      finalProportionalPartyResults[x.name] = Math.round(
        (x.votes / totalThresholdVotes) * 151,
      )
    }
  })

  let totalMMPThresholdVotes = 0

  rankedProportionalPartyResults.map(x => {
    if (
      x.votes / totalVotes > 0.05 ||
      typeof finalInstantRunoffResults[x.name] != 'undefined'
    ) {
      totalMMPThresholdVotes += x.votes
    }
  })

  let finalMMPPartyResults = {
    'Liberal National Party': 76,
    'Australian Labor Party': 60,
    'The Greens': 1,
    "Katter's Australian Party (KAP)": 1,
    'Centre Alliance': 1,
    Independent: 4,
  }

  rankedProportionalPartyResults.map(x => {
    if (
      (x.votes / totalVotes > 0.05 ||
        typeof finalInstantRunoffResults[x.name] != 'undefined') &&
      x.name != 'Independent'
    ) {
      let wonSeats = Math.round((x.votes / totalMMPThresholdVotes) * 151)
      if (finalMMPPartyResults[x.name] < wonSeats) {
        finalMMPPartyResults[x.name] = wonSeats
      }
    }
  })

  let displayResults = {
    instantRunoff: finalInstantRunoffResults,
    partyProportional: finalProportionalPartyResults,
    firstPastThePost: finalFPTPPartyResults,
    MMP: finalMMPPartyResults,
  }

  const [current, setCurrent] = useState('instantRunoff')

  let total = 0

  Object.values(displayResults[current]).map(x => {
    total += x
  })

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container as="main" py={2} variant="copy" ref={mainBodyRef}>
        <div style={{ margin: 'auto', textAlign: 'left' }}>
          <p>
            <span data-tip data-for={`tip-LNP`}>
              {[
                ...Array(
                  displayResults[current]['Liberal National Party'],
                ).keys(),
              ].map(x => (
                <Box
                  sx={{ bg: 'rgba(0,112,243, 0.2)', display: 'inline-block' }}
                >
                  <Box
                    sx={{
                      height: ['21px', '42px'],
                      width: ['21px', '42px'],
                      bg: 'success',
                      borderRadius: '50%',
                      display: 'inline-block',
                      m: ['6px', '12px'],
                    }}
                  />
                </Box>
              ))}
            </span>
            <Tooltip
              id={`tip-LNP`}
              effect="solid"
              delayShow={0}
              delayHide={20}
              className="lnp-tip-transform"
            >
              Liberal National Coalition:{' '}
              {displayResults[current]['Liberal National Party']} seats (
              {Math.round(
                (displayResults[current]['Liberal National Party'] / total) *
                  1000,
              ) / 10}
              %)
            </Tooltip>
            <span data-tip data-for={`tip-ALP`}>
              {[
                ...Array(
                  displayResults[current]['Australian Labor Party'],
                ).keys(),
              ].map(x => (
                <Box sx={{ bg: 'rgba(238,0,0, 0.2)', display: 'inline-block' }}>
                  <Box
                    sx={{
                      height: ['21px', '42px'],
                      width: ['21px', '42px'],
                      bg: 'error',
                      borderRadius: '50%',
                      display: 'inline-block',
                      m: ['6px', '12px'],
                    }}
                  />
                </Box>
              ))}
            </span>
            <Tooltip id={`tip-ALP`} effect="solid" delayShow={0} delayHide={20}>
              Labor Party: {displayResults[current]['Australian Labor Party']}{' '}
              seats (
              {Math.round(
                (displayResults[current]['Australian Labor Party'] / total) *
                  1000,
              ) / 10}
              %)
            </Tooltip>
            <span data-tip data-for={`tip-GRN`}>
              {[...Array(displayResults[current]['The Greens']).keys()].map(
                x => (
                  <Box
                    sx={{
                      bg: 'rgba(80,227,194, 0.2)',
                      display: 'inline-block',
                    }}
                  >
                    <Box
                      sx={{
                        height: ['21px', '42px'],
                        width: ['21px', '42px'],
                        bg: 'cyan',
                        borderRadius: '50%',
                        display: 'inline-block',
                        m: ['6px', '12px'],
                      }}
                    />
                  </Box>
                ),
              )}
            </span>
            <Tooltip
              id={`tip-GRN`}
              effect="solid"
              delayShow={0}
              delayHide={20}
              className="lnp-tip-transform"
            >
              The Greens: {displayResults[current]['The Greens']} seats (
              {Math.round(
                (displayResults[current]['The Greens'] / total) * 1000,
              ) / 10}
              %)
            </Tooltip>
            <span data-tip data-for={`tip-KAT`}>
              {[
                ...Array(
                  typeof displayResults[current][
                    "Katter's Australian Party (KAP)"
                  ] != 'undefined'
                    ? displayResults[current]["Katter's Australian Party (KAP)"]
                    : 0,
                ).keys(),
              ].map(x => (
                <Box sx={{ bg: 'rgba(128,0,0, 0.2)', display: 'inline-block' }}>
                  <Box
                    sx={{
                      height: ['21px', '42px'],
                      width: ['21px', '42px'],
                      bg: 'maroon',
                      borderRadius: '50%',
                      display: 'inline-block',
                      m: ['6px', '12px'],
                    }}
                  />
                </Box>
              ))}
            </span>
            <Tooltip
              id={`tip-KAT`}
              effect="solid"
              delayShow={0}
              delayHide={20}
              className="lnp-tip-transform"
            >
              Katter's Australian Party:{' '}
              {displayResults[current]["Katter's Australian Party (KAP)"]} seats
              (
              {Math.round(
                (displayResults[current]["Katter's Australian Party (KAP)"] /
                  total) *
                  1000,
              ) / 10}
              %)
            </Tooltip>
            <span data-tip data-for={`tip-CA`}>
              {[
                ...Array(
                  typeof displayResults[current]['Centre Alliance'] !=
                    'undefined'
                    ? displayResults[current]['Centre Alliance']
                    : 0,
                ).keys(),
              ].map(x => (
                <Box
                  sx={{
                    bg: 'rgba(244, 155, 11, 0.2)',
                    display: 'inline-block',
                  }}
                >
                  <Box
                    sx={{
                      height: ['21px', '42px'],
                      width: ['21px', '42px'],
                      bg: 'warningDark',
                      borderRadius: '50%',
                      display: 'inline-block',
                      m: ['6px', '12px'],
                    }}
                  />
                </Box>
              ))}
            </span>
            <Tooltip
              id={`tip-CA`}
              effect="solid"
              delayShow={0}
              delayHide={20}
              className="lnp-tip-transform"
            >
              Centre Alliance: {displayResults[current]['Centre Alliance']}{' '}
              seats (
              {Math.round(
                (displayResults[current]['Centre Alliance'] / total) * 1000,
              ) / 10}
              %)
            </Tooltip>
            <span data-tip data-for={`tip-IND`}>
              {[
                ...Array(
                  typeof displayResults[current]['Independent'] != 'undefined'
                    ? displayResults[current]['Independent']
                    : 0,
                ).keys(),
              ].map(x => (
                <Box
                  sx={{
                    bg: 'rgba(235, 54, 127, 0.2)',
                    display: 'inline-block',
                  }}
                >
                  <Box
                    sx={{
                      height: ['21px', '42px'],
                      width: ['21px', '42px'],
                      bg: 'magenta',
                      borderRadius: '50%',
                      display: 'inline-block',
                      m: ['6px', '12px'],
                    }}
                  />
                </Box>
              ))}
            </span>
            <Tooltip
              id={`tip-IND`}
              effect="solid"
              delayShow={0}
              delayHide={20}
              className="lnp-tip-transform"
            >
              Independents: {displayResults[current]['Independent']} seats (
              {Math.round(
                (displayResults[current]['Independent'] / total) * 1000,
              ) / 10}
              %)
            </Tooltip>
          </p>
        </div>
      </Container>
      <Box
        sx={{
          position: 'sticky',
          bg: 'gray.1',
          bottom: 3,
          height: '80px',
          width: '100vw',
          maxWidth: '500px',
          mx: 'auto',
          left: 0,
          right: 0,
          borderRadius: 10,
        }}
      >
        <Grid columns={'1fr 1fr 1fr 1fr'} gap={'0px'}>
          <Box
            sx={{
              '&:hover': { bg: 'gray.2' },
              height: '80px',
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10,
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
            }}
            onClick={() => setCurrent('firstPastThePost')}
            data-tip
            data-for={`tip-firstPastThePost`}
          >
            <Box
              sx={{
                height: '48px',
                width: '48px',
                border: '3px solid',
                borderColor:
                  current == 'firstPastThePost' ? 'success' : 'gray.5',
                color: current == 'firstPastThePost' ? 'success' : 'gray.5',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <Box sx={{ fontWeight: '400', fontSize: '32px' }}>1</Box>
            </Box>
            <Tooltip
              id={`tip-firstPastThePost`}
              place="top"
              effect="solid"
              delayShow={0}
              delayHide={20}
            >
              Single member constituencies with first past the post (the UK's
              current system)
            </Tooltip>
          </Box>

          <Box
            sx={{
              '&:hover': { bg: 'gray.2' },
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
            }}
            onClick={() => setCurrent('MMP')}
            data-tip
            data-for={`tip-MMP`}
          >
            <Box
              sx={{
                height: '48px',
                width: '48px',
                border: '3px solid',
                borderColor: current == 'MMP' ? 'success' : 'gray.5',
                color: current == 'MMP' ? 'success' : 'gray.5',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <Box sx={{ fontWeight: '600', fontSize: '32px' }}>
                <Users />
              </Box>
              <Tooltip
                id={`tip-MMP`}
                place="top"
                effect="solid"
                delayShow={0}
                delayHide={20}
              >
                Mixed member proportional representation (following a NZ-style
                system)
              </Tooltip>
            </Box>
          </Box>
          <Box
            sx={{
              '&:hover': { bg: 'gray.2' },
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
            }}
            onClick={() => setCurrent('instantRunoff')}
            data-tip
            data-for={`tip-instantRunoff`}
          >
            <Box
              sx={{
                height: '48px',
                width: '48px',
                border: '3px solid',
                borderColor: current == 'instantRunoff' ? 'success' : 'gray.5',
                color: current == 'instantRunoff' ? 'success' : 'gray.5',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <Box sx={{ fontWeight: '600', fontSize: '32px' }}>
                <User />
              </Box>
              <Tooltip
                id={`tip-instantRunoff`}
                place="top"
                effect="solid"
                delayShow={0}
                delayHide={20}
              >
                Instant runoff (Australia's current system)
              </Tooltip>
            </Box>
          </Box>
          <Box
            sx={{
              '&:hover': { bg: 'gray.2' },
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              justifyItems: 'center',
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
            }}
            data-tip
            data-for={`tip-partyProportional`}
            onClick={() => {
              setCurrent('partyProportional')
            }}
          >
            <Box
              sx={{
                height: '48px',
                width: '48px',
                border: '3px solid',
                borderColor:
                  current == 'partyProportional' ? 'success' : 'gray.5',
                color: current == 'partyProportional' ? 'success' : 'gray.5',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <Box sx={{ fontWeight: '600', fontSize: '32px' }}>
                <Percent />
              </Box>
            </Box>
            <Tooltip
              id={`tip-partyProportional`}
              place="top"
              effect="solid"
              delayShow={0}
              delayHide={20}
            >
              Party-list proportional representation (with a 5% threshold)
            </Tooltip>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}

export default Named
