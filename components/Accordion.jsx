import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function Accordion ({ title, children, isOpen, onClick }) {
  return (
    <div className='w-full mx-auto'>
      <div className='bg-secondary-100 overflow-hidden rounded-xl'>
        <div
          className='px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer'
          onClick={onClick}
        >
          <h3 className='text-lg leading-6 text-gray-700 font-bold'>{title}</h3>
          <ChevronDown
            className={`h-4 w-4 transform transition-transform duration-700 text-gray-900 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
        <div
          className={`bg-secondary-100 transition-max-height duration-700 overflow-hidden ${
            isOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className='bg-ocre-600 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
            <div className='text-gray-600 sm:mt-0 sm:col-span-3'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const AccordionList = ({ data }) => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className='w-full space-y-3 h-[500px]'>
      {data.map((item, index) => (
        <Accordion
          key={index}
          title={item.question}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <p>{item.answer}</p>
        </Accordion>
      ))}
    </div>
  )
}

export default AccordionList
