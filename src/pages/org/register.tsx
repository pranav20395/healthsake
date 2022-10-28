import Link from "next/link";
import IntroLayout from "../../client/Layout/intro";
import {authedNoEntry} from "@/utils/authedNoEntry";

export const getServerSideProps = authedNoEntry(async (ctx) => {
    return {props: {}};
});

function Register() {
    return (
        <IntroLayout title="Organisation Registration">
            <h1 className="font-semibold text-2xl">Register Organisation</h1>
            {/* Account Registration Form */}
            <form className="flex flex-col gap-6">
                <label className="flex flex-col gap-2 text-sm">
                    Organisation Name:
                    <input className="py-2 px-2 rounded-lg text-black" type="text"/>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                    Description:
                    <textarea className="py-2 px-2 rounded-lg text-black"/>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                    Set Admin Email:
                    <input className="py-2 px-2 rounded-lg text-black" type="email"/>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                    Set Password:
                    <input className="py-2 px-2 rounded-lg text-black" type="password"/>
                </label>
                <button
                    className="rounded-xl p-3 px-8 text-sm transition-all ease-in-out bg-indigo-600 hover:shadow-2xl"
                    type="submit">Register
                </button>
                <Link href="/org/login"><span className="text-gray-500 text-sm cursor-pointer text-center">Already Registered?</span></Link>
            </form>
        </IntroLayout>
    );
}

export default Register;