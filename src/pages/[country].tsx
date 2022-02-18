import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Layout from '../components/Layout'
import { ParsedUrlQuery } from "querystring";
import countries from '../countries.json'
import { TimeSeriesType } from "../types";
import { getNewCasesArray } from "../utils/toArray";
import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import HistoricalCases from "../components/HistoricalCases";
import { Reflector } from "../components/Reflector";

export default function Country({ jsonData }: InferGetStaticPropsType<typeof getStaticProps>) {
    const data = jsonData.timeline
    if (!data) {
        return (
            <main>
                <h1>this page currently has some problem</h1>
            </main>
        )
    }

    const casesData = getNewCasesArray(data.cases)
    const lastUpdated = useMemo(() => casesData[casesData.length -1].title, [casesData])


    return (
        <>
            <main>
                <h1>COVID-19 PANDEMIC STATISTICS</h1>
                <h2>{jsonData.country}</h2>
                <p><small>last updated: {lastUpdated}</small></p>
                <section>

                    <Canvas>
                        <ambientLight />
                        <HistoricalCases data={data} />
                        <Reflector />
                    </Canvas>

                    <div className="canvas-layout">
                        <div className="bar-desc">
                        </div>
                        <button className='back-button' >BACK</button>
                    </div>

                </section>
                
            </main>
        </>
        
    )
}

interface Props {
    jsonData: CountryHistoricalType
}

interface Params extends ParsedUrlQuery {
    country: string
}

interface CountryHistoricalType {
    country: string,
    province : string[],
    timeline: TimeSeriesType
}

export const getStaticProps: GetStaticProps<Props, Params> = async (context) => {
    const params = context.params!
    let { country } = params
    country = country.replaceAll('-', ' ')
    let iso3 = ''
    for (const c in countries) {
        if (c === country) {
            //@ts-ignore
            iso3 = countries[country].iso3
            break
        }
    }

    const res = await fetch(`https://disease.sh/v3/covid-19/historical/${iso3}?lastdays=360`)
    const jsonData: CountryHistoricalType = await res.json()
    
    
    
    return {
        props: { jsonData },
        revalidate: 60*60*24
    }
}



export const getStaticPaths: GetStaticPaths<Params> = async () => {
    const paths = []
    
    for (const country in countries) {
        //@ts-ignore
        const slug: string = countries[country].slug
        console.log(slug)
        paths.push({ params: { country: slug, days: '30' }})
    }



    return { paths, fallback: true }
}