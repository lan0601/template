import React, {Component} from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { toWords } from 'number-to-words';

export default class NewComponent extends Component{
    state={
        // name:'Allan',
        // age:25,
        // mobile:9550591882,
        // skills: ['react','vue','laravel','php'],
        number: ''
    }

    handleClick=(e)=>
    {
        console.log("Button is clicked!");
    }

    handleMouseOver=(e)=>
    {
        console.log(e.target,e.pageX, e.pageY);
    }

    handleCopy=(e)=>
    {
        console.log('Paragraph have been copy');
    }

    handleChangeState=(e)=>
    {
        this.setState({
            name:'Zap',
            age:26,
            mobile:9550591882
        });
    }

    handleChange=(e)=>{
        const { name, value } = e.target;
        let newState = {
            [name]: value
        };
        if (name === 'number') {
            newState.numberWords = value ? toWords(Number(value)) : '';
        }
        this.setState(newState);
        // this.setState({
        //     [e.target.name]:e.target.value
        // });
    }

    handleSubmit=(e)=>
    {
        e.preventDefault();
        console.log(this.state);

        this.setState({
            name:'Zap',
            age:26,
            mobile:9550591882,
            number:this.state.numberWords
        });
    }

    render(){
        return(
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Numbers
                    </h2>
                }
            >
                <Head title="New Component" />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div>
                                    {/* <h1>This is a Class Component</h1> */}
                                    {/* <p>Name: {this.state.name}</p>
                                    <p>Age: {this.state.age}</p>
                                    <p>Mobile: {this.state.mobile}</p>
                                    <p>Skills: {this.state.skills.join(',')}</p> */}
                                    <p>Number: {this.state.number}</p>


                                    {/* <button type="button" onClick={this.handleClick} onMouseOver={this.handleMouseOver}>Click Here</button>

                                    <p onCopy={this.handleCopy}>This is a test paragraph</p>
                                    <button type="button" onClick={this.handleChangeState}>Change State</button> */}
                                    <form onSubmit={this.handleSubmit}>
                                        {/* <div className="m-2">
                                            <div className='col-md-4'>
                                                <InputLabel>Name: </InputLabel>
                                            </div>
                                            <div className="col-md-8">
                                                <TextInput name="name" onChange={this.handleChange}></TextInput >
                                            </div>
                                        </div>
                                            
                                        <div className="m-2">
                                            <div className='col-md-4'>
                                                <InputLabel>Age: </InputLabel>
                                            </div>
                                            <div className="col-md-8">
                                                <TextInput name="age" onChange={this.handleChange}></TextInput >
                                            </div>
                                        </div>
                                            
                                        <div className="m-2">
                                            <div className='col-md-4'>
                                                <InputLabel>Mobile: </InputLabel>
                                            </div>
                                            <div className="col-md-8">
                                                <TextInput name="mobile" onChange={this.handleChange}></TextInput >
                                            </div>
                                        </div> */}

                                        <div className="m-2">
                                            <div className='col-md-4'>
                                                <InputLabel>Number: </InputLabel>
                                            </div>
                                            <div className="col-md-8">
                                                <TextInput name="number" onChange={this.handleChange}></TextInput >
                                            </div>
                                        </div>
                                            
                                        
                                        {/* Name : <input type="text" name="name" onChange={this.handleChange}/> <br/> */}
                                        {/* Age : <input type="text" name="age" onChange={this.handleChange}/> <br/> */}
                                        {/* Mobile : <input type="text" name="mobile" onChange={this.handleChange}/> <br/> */}
                                        {/* <button type="submit">Submit</button> */}
                                        <PrimaryButton type="submit">Submit</PrimaryButton>
                                    </form>
                                    
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </AuthenticatedLayout>
            
        )
    }
}
